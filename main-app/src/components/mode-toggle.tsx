"use client";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { useColorScheme } from "@mui/material/styles";

/**
 * Light/dark toggle. MUI's useColorScheme persists the choice and applies the
 * `.dark` class to <html>, which flips the CSS tokens in globals.css — so
 * every Tailwind-styled component follows automatically.
 */
export function ModeToggle({ size }: { size?: "small" | "medium" }) {
  const { mode, systemMode, setMode } = useColorScheme();
  // SSR-safe hydration check without setState-in-effect
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  if (!mounted) return <IconButton aria-label="Toggle dark mode" size={size} data-tour="mode-toggle" disabled />;

  const resolved = mode === "system" ? systemMode : mode;
  const dark = resolved === "dark";
  return (
    <Tooltip title={dark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setMode(dark ? "light" : "dark")}
        size={size}
        data-tour="mode-toggle"
      >
        {dark ? (
          <LightModeRoundedIcon fontSize={size} />
        ) : (
          <DarkModeRoundedIcon fontSize={size} />
        )}
      </IconButton>
    </Tooltip>
  );
}
