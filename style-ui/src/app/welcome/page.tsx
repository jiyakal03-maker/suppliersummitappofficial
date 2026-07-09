"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { WelcomeReveal } from "@/components/homepage/welcome-reveal";

/**
 * Route: /welcome
 * Landed on immediately after QR badge login resolves. Shows the
 * timer-based WelcomeReveal once, then redirects into Event Info.
 *
 * Replace the static values below with the authenticated supplier record
 * once auth/session wiring lands (see WelcomeReveal's tableNumber note —
 * confirm whether an unassigned table should fall back to a placeholder
 * like "TBD" before this goes further).
 */
export default function WelcomePage() {
  const router = useRouter();

  return (
    <WelcomeReveal
      name="Sarah Chen"
      company="Hendrick Screen"
      tableNumber={12}
      onComplete={() => router.replace("/")}
    />
  );
}