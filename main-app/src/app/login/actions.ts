"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function loginWithPin(uniqueId: string, pin: string) {
  const admin = createAdminClient();

  // verify_pin runs SECURITY DEFINER server-side — RLS never lets a client
  // read the pin column directly, so this is the only place PINs get checked.
  const { data: userId, error: verifyError } = await admin.rpc("verify_pin", {
    p_unique_id: uniqueId.trim(),
    p_pin: pin,
  });

  if (verifyError || !userId) {
    return { error: "Invalid ID or PIN" };
  }

  const { data: authUser, error: lookupError } = await admin.auth.admin.getUserById(userId);
  const email = authUser?.user?.email;
  if (lookupError || !email) {
    return { error: "This account isn't set up for login yet" };
  }

  // No password is ever set for these accounts — mint a one-time magic-link
  // token server-side (service role) and immediately redeem it as a real
  // session, so RLS's auth.uid() lines up with user.user_id exactly.
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const tokenHash = link?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    return { error: "Could not start a session" };
  }

  const supabase = await createClient();
  const { error: verifyOtpError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });

  if (verifyOtpError) {
    return { error: "Could not start a session" };
  }

  return { error: null };
}
