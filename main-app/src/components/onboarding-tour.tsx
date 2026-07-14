"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import Button from "@mui/material/Button";
import { ONBOARDING_SEEN_KEY } from "@/lib/onboarding";

/**
 * Spotlight tour over the REAL nav bar — not a standalone slide deck.
 * Auto-starts the first time someone lands on "/" (checked once per browser
 * via ONBOARDING_SEEN_KEY, set by welcome/page.tsx's redirect). Each step
 * targets an actual DOM node via a `data-tour` attribute (see mode-toggle.tsx
 * and top-nav.tsx) rather than a copy of the UI, so what's highlighted is
 * whatever's really on screen — no risk of the tour drifting from the app.
 *
 * Only runs on "/" (the nav elements it targets aren't meaningfully
 * different on other pages, and re-running it on route changes would be
 * annoying) — skips entirely if this browser has already seen it.
 */
const STEPS = [
  {
    selector: '[data-tour="mode-toggle"]',
    title: "Switch appearance",
    body: "Toggle between light and dark mode anytime — your choice is remembered.",
  },
  {
    selector: '[data-tour="qr-scan"]',
    title: "Scan a badge",
    body: "Tap here to scan someone else's badge QR code and save their contact instantly.",
  },
  {
    selector: '[data-tour="profile"]',
    title: "Your profile",
    body: "Manage your profile — and your own contact-sharing settings — from here.",
  },
  {
    selector: '[data-tour="question-fab"]',
    title: "Ask a question",
    body: "Have something for a speaker? Submit it here anytime during a session.",
  },
];

const TOOLTIP_WIDTH = 288;
// Rough estimate, not measured — good enough to decide above-vs-below;
// worst case the card is a little short of the margin on a very small step.
const TOOLTIP_HEIGHT_ESTIMATE = 180;
const MARGIN = 16;

export function OnboardingTour() {
  const pathname = usePathname();
  const [active, setActive] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    if (pathname !== "/") return;
    if (window.localStorage.getItem(ONBOARDING_SEEN_KEY)) return;
    setActive(true);
  }, [pathname]);

  React.useEffect(() => {
    if (!active) return;
    const el = document.querySelector<HTMLElement>(STEPS[index].selector);
    if (!el) {
      setRect(null);
      return;
    }
    const update = () => setRect(el.getBoundingClientRect());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, index]);

  const finish = React.useCallback(() => {
    window.localStorage.setItem(ONBOARDING_SEEN_KEY, "1");
    setActive(false);
  }, []);

  if (!active || !rect) return null;

  const isLast = index === STEPS.length - 1;
  const step = STEPS[index];
  const tooltipLeft = Math.min(
    Math.max(rect.left, MARGIN),
    window.innerWidth - TOOLTIP_WIDTH - MARGIN
  );
  const spaceBelow = window.innerHeight - rect.bottom;
  const placeAbove = spaceBelow < TOOLTIP_HEIGHT_ESTIMATE + MARGIN;
  const tooltipTop = placeAbove
    ? Math.max(rect.top - TOOLTIP_HEIGHT_ESTIMATE - 16, MARGIN)
    : rect.bottom + 16;

  return (
    // z-[60]: above GlobalQuestionFab's z-50, which mounts after this in the
    // DOM (root layout renders {children} then the FAB) and would otherwise
    // paint on top of the spotlight/tooltip when this step targets it.
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <div
        className="absolute rounded-(--radius-control) transition-all duration-300 ease-out"
        style={{
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
          border: "2px solid var(--color-yellow)",
        }}
      />
      <div
        className="animate-summit-fade pointer-events-auto absolute rounded-(--radius-card) bg-surface p-4 shadow-lg"
        style={{ top: tooltipTop, left: tooltipLeft, width: TOOLTIP_WIDTH }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-grey-500">
          {index + 1} of {STEPS.length}
        </p>
        <p className="mt-1 text-[15px] font-semibold text-ink">{step.title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-grey-600">{step.body}</p>
        <div className="mt-3 flex items-center justify-between">
          <Button variant="text" color="secondary" onClick={finish}>
            Skip
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}
          >
            {isLast ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
