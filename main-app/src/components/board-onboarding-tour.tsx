"use client";
import * as React from "react";
import Button from "@mui/material/Button";
import {
  GROWTH_MACHINE_BUILDER_ONBOARDING_SEEN_KEY,
  GROWTH_MACHINE_SPECTATOR_ONBOARDING_SEEN_KEY,
} from "@/lib/onboarding";

/**
 * Spotlight tour over the REAL /growth-machine/board UI — same pattern as
 * the nav bar's OnboardingTour (components/onboarding-tour.tsx): each step
 * targets an actual DOM node via a `data-tour` attribute (see the toolbar/
 * style-panel/prompt-banner tags in text.tsx, and the Leave board button
 * below) rather than a copy of the UI.
 *
 * Builder and Spectator get different steps (separate localStorage keys —
 * seeing one shouldn't skip the other). A step with `selector: null` has no
 * specific target — used for Spectator's "scribble anywhere" tip, since
 * there's no single element to point at for that.
 *
 * The targeted elements (prompt banner, toolbar, style panel) are rendered
 * by BuilderFlow inside GrowthMachine, which mounts a beat after this
 * component (tldraw's onMount fires, then BuilderFlow's own setup effect
 * runs) — so each step polls briefly for its target rather than assuming
 * it's already in the DOM.
 */
type Step = { selector: string | null; title: string; body: string };

const BUILDER_STEPS: Step[] = [
  {
    selector: '[data-tour="prompt-banner"]',
    title: "Track your progress",
    body: "Shows which prompt you're on. Tap Submit when you're done to move to the next one.",
  },
  {
    selector: '[data-tour="toolbar"]',
    title: "Draw here",
    body: "Use these tools to sketch your answer to the prompt.",
  },
  {
    selector: '[data-tour="style-panel"]',
    title: "Colors & styles",
    body: "Change color, stroke size, and fill for whatever you're drawing.",
  },
  {
    selector: '[data-tour="leave-board"]',
    title: "Leave anytime",
    body: "Come back here to exit the board and pick a different role.",
  },
];

const SPECTATOR_STEPS: Step[] = [
  {
    selector: '[data-tour="leave-board"]',
    title: "Leave anytime",
    body: "Come back here to exit the board.",
  },
  {
    selector: null,
    title: "Just watching",
    body: "You're viewing the Builder's board live. Scribble anywhere on the canvas to point something out — it fades on its own and isn't saved.",
  },
];

const TOOLTIP_WIDTH = 288;
const TOOLTIP_HEIGHT_ESTIMATE = 180;
const MARGIN = 16;
const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 150;

export function BoardOnboardingTour({ role }: { role: "builder" | "spectator" }) {
  const seenKey =
    role === "builder" ? GROWTH_MACHINE_BUILDER_ONBOARDING_SEEN_KEY : GROWTH_MACHINE_SPECTATOR_ONBOARDING_SEEN_KEY;
  const steps = role === "builder" ? BUILDER_STEPS : SPECTATOR_STEPS;

  const [active, setActive] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    if (!window.localStorage.getItem(seenKey)) setActive(true);
  }, [seenKey]);

  React.useEffect(() => {
    if (!active) return;
    const selector = steps[index].selector;
    if (!selector) {
      setRect(null);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let cleanupListeners: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout>;

    const poll = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        const update = () => setRect(el.getBoundingClientRect());
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        cleanupListeners = () => {
          window.removeEventListener("resize", update);
          window.removeEventListener("scroll", update, true);
        };
        return;
      }
      if (attempts++ < MAX_POLL_ATTEMPTS) {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };
    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      cleanupListeners?.();
    };
  }, [active, index, steps]);

  const finish = React.useCallback(() => {
    window.localStorage.setItem(seenKey, "1");
    setActive(false);
  }, [seenKey]);

  if (!active) return null;

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const hasTarget = step.selector !== null;
  if (hasTarget && !rect) return null;

  const tooltipStyle: React.CSSProperties = rect
    ? (() => {
        const left = Math.min(Math.max(rect.left, MARGIN), window.innerWidth - TOOLTIP_WIDTH - MARGIN);
        const spaceBelow = window.innerHeight - rect.bottom;
        const placeAbove = spaceBelow < TOOLTIP_HEIGHT_ESTIMATE + MARGIN;
        const top = placeAbove
          ? Math.max(rect.top - TOOLTIP_HEIGHT_ESTIMATE - 16, MARGIN)
          : rect.bottom + 16;
        return { position: "fixed", top, left, width: TOOLTIP_WIDTH };
      })()
    : { position: "fixed", top: "50%", left: "50%", width: TOOLTIP_WIDTH, transform: "translate(-50%, -50%)" };

  return (
    <div className="pointer-events-none fixed inset-0 z-[700]">
      {rect ? (
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
      ) : (
        <div className="absolute inset-0 bg-black/60" />
      )}
      <div
        className="animate-summit-fade pointer-events-auto rounded-(--radius-card) bg-surface p-4 shadow-lg"
        style={tooltipStyle}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-grey-500">
          {index + 1} of {steps.length}
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
