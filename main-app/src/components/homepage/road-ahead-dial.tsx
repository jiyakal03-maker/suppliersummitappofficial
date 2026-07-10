"use client";
import * as React from "react";
import { CONTAINER } from "../layout";

/**
 * About Us — follows Historic Roadmap in the About Us scroll.
 *
 * Etnyre's "Road Ahead" model: five steps arranged in a ring. Desktop shows
 * every step as a circular card with its full copy at once (a static ring,
 * revealed with a scroll-triggered stagger) — no center hub, since the ring
 * alone reads clearly at that size. Mobile swaps to a rotating dial of
 * numbered pins around a center "Improving Lives" hub with a single content
 * card below, since five full cards can't fit legibly on a phone-width ring.
 *
 * Split is 860px, which is narrower than this codebase's usual `sm:` (640px)
 * breakpoint — there's no shared breakpoint token for it, so the split is
 * done here via Tailwind arbitrary variants (`min-[860px]:` / `max-[859px]:`)
 * rather than introducing a new global breakpoint.
 *
 * Distinct interaction pattern on purpose: unlike OurValues (hover-bloom,
 * dims siblings) or MissionVision (tap-to-flip), desktop here is a plain
 * hover-lift affordance since all copy is already visible, and mobile is a
 * rotate-to-select dial rather than a flip or bloom.
 */

type Step = { number: number; label: string; title: string; description: string };

const STEPS: Step[] = [
  { number: 1, label: "Design & Build", title: "Design & Build", description: "Superior products & components." },
  { number: 2, label: "Attract", title: "Attract", description: "Customers & distribution partners." },
  { number: 3, label: "Provide", title: "Provide", description: "Strong customer support & build brand loyalty." },
  { number: 4, label: "Optimize", title: "Optimize", description: "Profit." },
  { number: 5, label: "Invest", title: "Invest", description: "In our growth." },
];

const RADIUS_DESKTOP = 190;
const RADIUS_MOBILE = 108;
const STEP_ANGLE = 360 / STEPS.length;
const STAGGER_MS = 70;

/** Angle (deg) of step i's pin/card on the ring, 0deg = top, clockwise. */
function angleFor(i: number) {
  return i * STEP_ANGLE - 90;
}

export function RoadAheadDial({ steps = STEPS }: { steps?: Step[] }) {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = React.useState(0);
  const [settled, setSettled] = React.useState<boolean[]>(() => steps.map(() => false));
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  React.useEffect(() => {
    if (reducedMotion) {
      setRevealed(steps.length);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          steps.forEach((_, i) => {
            setTimeout(() => setRevealed((c) => Math.max(c, i + 1)), i * STAGGER_MS);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [steps, reducedMotion]);

  const active = steps[activeIndex];

  return (
    <section ref={sectionRef} className={`${CONTAINER} py-12 lg:py-16`}>
      {/* Desktop: static ring, all copy always visible */}
      <div className="relative mx-auto hidden min-[860px]:block" style={{ width: RADIUS_DESKTOP * 2 + 200, height: RADIUS_DESKTOP * 2 + 200 }}>
        <svg
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          width={RADIUS_DESKTOP * 2}
          height={RADIUS_DESKTOP * 2}
          aria-hidden="true"
        >
          <circle
            cx={RADIUS_DESKTOP}
            cy={RADIUS_DESKTOP}
            r={RADIUS_DESKTOP - 1}
            fill="none"
            stroke="var(--color-grey-200)"
            strokeWidth={1.5}
          />
        </svg>
        {steps.map((step, i) => {
          const angle = angleFor(i);
          const isRevealed = i < revealed;
          // The entrance animation still owns `transform` while it's applied
          // (its `forwards` fill keeps claiming the property even once
          // finished), so it can't share an element with the hover-lift
          // transform. Drop the class once the animation ends so hover can
          // then freely translate the card.
          const isAnimating = !reducedMotion && !settled[i];
          return (
            <div
              key={step.number}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${RADIUS_DESKTOP}px) rotate(${-angle}deg)`,
              }}
            >
              <div
                className={`flex h-[168px] w-[168px] flex-col items-center justify-center rounded-full border border-grey-200 bg-yellow-tint p-5 text-center shadow-sm ${
                  isAnimating
                    ? "animate-summit-rise"
                    : "opacity-100 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1.5 hover:shadow-lg"
                }`}
                style={
                  isAnimating
                    ? {
                        animationDelay: `${i * STAGGER_MS}ms`,
                        animationPlayState: isRevealed ? "running" : "paused",
                      }
                    : undefined
                }
                onAnimationEnd={() => setSettled((s) => (s[i] ? s : s.map((v, j) => (j === i ? true : v))))}
              >
                <p className="text-[12px] font-bold text-grey-500">{String(step.number).padStart(2, "0")}</p>
                <p className="mt-1 text-[14px] font-semibold text-ink">{step.title}</p>
                <p className="mt-1 text-[11px] leading-snug text-grey-600">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: rotating dial of pins + single active-step card */}
      <div className="mx-auto flex flex-col items-center min-[860px]:hidden">
        <div className="relative" style={{ width: RADIUS_MOBILE * 2 + 56, height: RADIUS_MOBILE * 2 + 56 }}>
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            width={RADIUS_MOBILE * 2}
            height={RADIUS_MOBILE * 2}
            aria-hidden="true"
          >
            <circle
              cx={RADIUS_MOBILE}
              cy={RADIUS_MOBILE}
              r={RADIUS_MOBILE - 1}
              fill="none"
              stroke="var(--color-grey-200)"
              strokeWidth={1.5}
            />
          </svg>
          <Hub radius={0} small />
          <div
            className="absolute inset-0"
            style={{
              transform: `rotate(${-activeIndex * STEP_ANGLE}deg)`,
              transition: reducedMotion ? "none" : "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {steps.map((step, i) => {
              const angle = angleFor(i);
              const isActive = i === activeIndex;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`${step.label}: show details`}
                  aria-pressed={isActive}
                  className={`absolute left-1/2 top-1/2 flex h-9 w-9 items-center justify-center rounded-full border-2 text-[13px] font-bold ${
                    reducedMotion ? "" : "transition-colors duration-300"
                  } ${isActive ? "border-yellow bg-yellow text-on-yellow" : "border-grey-300 bg-surface text-grey-600"}`}
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${RADIUS_MOBILE}px) rotate(${-angle + activeIndex * STEP_ANGLE}deg)`,
                    transition: reducedMotion ? "none" : "transform 0.5s cubic-bezier(0.22,1,0.36,1), background-color 0.3s, border-color 0.3s, color 0.3s",
                  }}
                >
                  {step.number}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 w-full max-w-[320px] rounded-(--radius-card) border border-grey-200 bg-surface p-4 text-center shadow-sm">
          <p className="text-[13px] font-bold text-grey-500">{String(active.number).padStart(2, "0")}</p>
          <p className="mt-0.5 text-[15px] font-semibold text-ink">{active.title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-grey-600">{active.description}</p>
        </div>
      </div>
    </section>
  );
}

function Hub({ small }: { radius: number; small?: boolean }) {
  return (
    <div
      className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-tint text-center font-bold text-ink shadow-sm ${
        small ? "h-20 w-20 text-[13px]" : "h-32 w-32 text-[15px]"
      }`}
    >
      Improving
      <br />
      Lives
    </div>
  );
}
