"use client";
import * as React from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useToast } from "../feedback";

const SESSION_KEY = "ss_admin_unlocked";

/**
 * Demo-only, same pattern as /login (see login/page.tsx): checks a hardcoded
 * PIN rather than a real role lookup — there's no auth backend wired up yet.
 * Swap for a real check against user_info.role = 'admin' once Supabase Auth
 * is wired in. Unlock state lives in sessionStorage only (per-tab, cleared on
 * close) so this never silently persists across devices.
 */
const DEMO_ADMIN_PIN = "5555";

export function useAdminUnlocked() {
  const [unlocked, setUnlocked] = React.useState<boolean | null>(null); // null = not yet checked (avoids SSR flash)

  React.useEffect(() => {
    setUnlocked(sessionStorage.getItem(SESSION_KEY) === "true");
  }, []);

  const unlock = React.useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setUnlocked(true);
  }, []);

  const lock = React.useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
  }, []);

  return { unlocked, unlock, lock };
}

export function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const { toast, showToast } = useToast();
  const [pin, setPin] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === DEMO_ADMIN_PIN) {
      onUnlock();
    } else {
      showToast("Incorrect PIN", "error");
      setPin("");
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-20">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-grey-100 text-grey-700">
        <LockRoundedIcon fontSize="medium" />
      </span>

      <form onSubmit={handleSubmit} className="mt-6 w-full max-w-xs">
        <h1 className="text-center text-xl font-bold text-ink">Administration only</h1>
        <p className="mt-1.5 text-center text-sm text-grey-600">
          Enter the staff PIN to view this area
        </p>

        <div className="mt-7 flex flex-col gap-4">
          <TextField
            label="Staff PIN"
            type="password"
            inputMode="numeric"
            placeholder="4-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoComplete="off"
            autoFocus
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Unlock
          </Button>
        </div>
      </form>

      <div className="mt-6 rounded-(--radius-control) bg-yellow-tint px-3.5 py-2.5 text-center text-[13px] text-grey-700">
        Demo PIN — <span className="font-semibold text-ink">{DEMO_ADMIN_PIN}</span>
      </div>
      {toast}
    </div>
  );
}
