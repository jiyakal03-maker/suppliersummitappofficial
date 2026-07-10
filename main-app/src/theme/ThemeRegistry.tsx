"use client";
import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

/**
 * Wrap the app (in app/layout.tsx) with this provider.
 * - `enableCssLayer` puts MUI styles in the `mui` CSS layer declared in
 *   globals.css, so Tailwind utility classes always win when you need a tweak.
 * - `defaultMode="system"` + the .dark class selector keep MUI and Tailwind
 *   color schemes in lockstep (see ModeToggle).
 */
export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme} defaultMode="system">
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
