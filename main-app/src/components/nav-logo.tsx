"use client";
import * as React from "react";
import { useColorScheme } from "@mui/material/styles";

/**
 * Etnyre wordmark for the nav bar. Swaps to the white/yellow variant in dark
 * mode (etn-int-logo.png's dark text is unreadable on a dark background).
 * Same SSR-safe mount check as ModeToggle — resolved mode isn't known until
 * after hydration, so render the light variant (the default `mode`) until then.
 */
export function NavLogo() {
  const { mode, systemMode } = useColorScheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const resolved = mounted ? (mode === "system" ? systemMode : mode) : "light";
  const dark = resolved === "dark";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dark ? "/etn-int-dark.png" : "/etn-int-logo.png"}
      alt="Etnyre"
      className="h-12 w-auto object-contain"
    />
  );
}
