# Summit UI — Etnyre Supplier Summit component & style library

Next.js (App Router) + TypeScript + Tailwind CSS v4 + MUI v9.
Run `npm install && npm run dev` and open http://localhost:3000 for the live style guide.

## Where things live
- `src/app/globals.css` — design tokens (CSS variables) + Tailwind `@theme`. **Single source of truth for color.**
- `src/theme/theme.ts` — MUI theme mirroring the same tokens; all component overrides (Button, TextField, Chip, Switch, Tabs, Progress, Stepper, Alert, BottomNavigation, Fab, …).
- `src/theme/ThemeRegistry.tsx` — wraps the app; puts MUI styles in a CSS layer so Tailwind utilities always win.
- `src/components/` — custom components. Import from `@/components`.
- `src/app/page.tsx` — the style guide (also serves as usage documentation).

## Palette rules (agreed with design)
- **Yellow `#FFED00`** is the only accent. Always ink (`#1C1C1E`) text/icons on yellow — never white.
- **Ink + grey ramp** for everything structural. `#ABAAAC` is the deck's grey; `grey-50 #F7F6F3` is the surface tint.
- **No red anywhere.** Errors and warnings use the candy-corn amber ramp from the deck (`#F98719`): `amber-100` backgrounds, `amber-500/700` icons & fills, `amber-900` text (contrast-safe on white).
- **Success has no green.** Success toasts/alerts are ink surfaces with a yellow icon (`palette.success` is mapped to ink so MUI props stay valid).

## Dark mode
Built-in. `ModeToggle` (exported from `@/components`) switches light/dark/system; MUI's `useColorScheme` persists the choice and applies a `.dark` class to `<html>`. That class flips the CSS tokens in `globals.css` — the grey ramp inverts, ink becomes light, amber swaps ends — so Tailwind-styled components and the MUI theme change together with no per-component work. Rules that hold in both modes:
- Content on yellow is always `#1C1C1E` — use `text-on-yellow`, never `text-ink`, on yellow fills.
- The QR quiet zone stays literal white in dark mode (scannability).
- Poll result fills dim to 35% yellow in dark so labels stay readable.
- `InitColorSchemeScript` in `layout.tsx` prevents the wrong-scheme flash; keep `suppressHydrationWarning` on `<html>`.

## Layout convention
Tailwind handles layout and spacing; MUI handles interactive widgets. Reach for MUI `Box`/`Stack` only inside MUI composition (dialog internals etc.). Page shells use `PageContainer`; section titles use `SectionHeader`.

## Component inventory
Themed MUI (no wrapper needed): Button, IconButton, TextField, Checkbox, Radio, Switch, Chip, Tabs, Dialog, Snackbar/Alert, Linear/CircularProgress, Skeleton, Stepper, Avatar, BottomNavigation, Fab, Tooltip.

Custom (`@/components`):
- `TopAppBar`, `BottomNav`, `ProfileMenu` (inside TopAppBar) — navigation
- `PageContainer`, `SectionHeader`, `ListRow` — layout
- `SessionCard`, `SpeakerCard` (expandable), `StatCard` — display
- `QuestionFab` — expandable floating question submission (auto-hides via `hidden` prop on scanner screens)
- `PollCard` — vote → live yellow result bars
- `QuestionCard` — upvote + AI-grouped count
- `QrBadge` — frame for the share-contact QR (drop your chosen QR lib in as children)
- `ContactShareList` — per-field share toggles
- `FeedbackStepper` — one-question-per-step anonymous survey shell
- `Banner`, `EmptyState`, `LabeledProgress`, `useToast` — status & feedback
- `AiTag` — transparency chip for anything AI-generated (user-trust constraint)

## Notes
- Fonts are bundled locally via the `geist` package (no Google Fonts fetch at build time — CI-safe).
- `QrBadge` is dependency-free on purpose; add `react-qr-code` or `qrcode.react` when the QR decision is final.
