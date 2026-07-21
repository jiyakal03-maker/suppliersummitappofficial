"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Ends the real Supabase Auth session (not just a UI toast) and returns to /login. */
export function useSignOut() {
  const router = useRouter();

  return async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };
}
