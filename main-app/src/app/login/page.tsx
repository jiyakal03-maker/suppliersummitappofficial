"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { NavLogo, ModeToggle, useToast } from "@/components";

/**
 * Route: /login
 * Demo-only: checks the ID/PIN against a hardcoded pair below rather than a
 * real lookup — there's no auth backend wired up yet (see supabase schema
 * migration + user_info.pin_hash for where real PIN verification would
 * eventually live). Swap DEMO_ID/DEMO_PIN and the check in handleSubmit for
 * a real Supabase call once that's ready.
 */
const DEMO_ID = "SUMMIT2026";
const DEMO_PIN = "1234";

export default function LoginPage() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [uniqueId, setUniqueId] = React.useState("");
  const [pin, setPin] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uniqueId.trim() === DEMO_ID && pin === DEMO_PIN) {
      router.push("/welcome");
    } else {
      showToast("Invalid ID or PIN", "error");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex justify-end p-4">
        <ModeToggle />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-20">
        <NavLogo />

        <form onSubmit={handleSubmit} className="mt-10 w-full max-w-sm">
          <h1 className="text-center text-xl font-bold text-ink">Supplier check-in</h1>
          <p className="mt-1.5 text-center text-sm text-grey-600">
            Enter your badge ID and PIN to continue
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <TextField
              label="Unique ID"
              placeholder="e.g. SUMMIT2026"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              autoComplete="off"
              required
            />
            <TextField
              label="PIN"
              type="password"
              inputMode="numeric"
              placeholder="4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="off"
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Log in
            </Button>
          </div>
        </form>

        <div className="mt-6 rounded-(--radius-control) bg-yellow-tint px-3.5 py-2.5 text-center text-[13px] text-grey-700">
          Demo credentials — ID <span className="font-semibold text-ink">{DEMO_ID}</span> · PIN{" "}
          <span className="font-semibold text-ink">{DEMO_PIN}</span>
        </div>
      </div>
      {toast}
    </div>
  );
}
