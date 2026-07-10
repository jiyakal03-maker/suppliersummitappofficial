"use client";
import * as React from "react";
import { CONTAINER } from "../layout";

/**
 * About Us — Mission & Vision.
 * Sits directly after EtnBanner in the About Us scroll. Shares the same
 * full-bleed, color-inverted band treatment as EtnBanner (bg-black in light
 * mode, bg-[#2A2A2E] in dark mode) so the two sections read as one
 * continuous "About Us" moment rather than two unrelated blocks.
 *
 * Shape language: desktop uses two trapezoids (gentle diagonal cut),
 * staggered slightly — Mission first, Vision second, matching the site's
 * Mission→Vision order (deck order is reversed, site order is not).
 * Mobile is a literal hexagon, split down the middle: two hexagon halves,
 * same 25%/75% taper as EtnBanner's own hexagon, sitting flush (no gap).
 * The text box inside each half is padded to match the hexagon's own
 * geometry exactly — 25% padding on the pointed side, so text starts
 * precisely where the taper ends rather than guessing a safe margin.
 * The original hexagon's points face outward (Mission points left,
 * Vision points right).
 *
 * Desktop (sm and up): trapezoids sit side by side, both statements fully
 * visible — no interaction needed, there's room to just read them.
 * Mobile: hexagon halves sit flush with a slight vertical offset (Mission
 * a touch higher). Each is tap-to-flip — front shows the label + headline,
 * back reveals the full statement — since full text for both doesn't fit
 * comfortably above the fold on a phone.
 */

type Statement = {
  label: string;
  headline: string;
  body: string;
};

const MISSION: Statement = {
  label: "Mission",
  headline: "Purpose & Profit",
  body: "We build equipment that serves the infrastructure needs of the world — and stay financially strong enough to keep showing up for the people who depend on us.",
};

const VISION: Statement = {
  label: "Vision",
  headline: "Improving Lives",
  body: "The core of our vision is improving lives by serving the infrastructure needs of the world, while remaining competitive enough to do it for the long run.",
};

export function MissionVision() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] mt-2 w-screen">
      <div className={`${CONTAINER} py-12 sm:py-16`}>
        <p className="max-w-xl text-md font-medium leading-snug text-[#1C1C1E] sm:text-xl">
          Etnyre International is a manufacturing company passionately
          pursuing both purpose and profit.
        </p>

        {/* Desktop: side by side, fully readable, no interaction */}
        <div className="mt-10 hidden gap-5 sm:flex">
          <TrapezoidStatic statement={MISSION} tone="yellow" lean="right" className="flex-1" />
          <TrapezoidStatic
            statement={VISION}
            tone="grey"
            lean="left"
            className="flex-1 -ml-3"
            paddingLeftClass="pl-14"
          />
        </div>

        {/* Mobile: hexagon halves, rejoined (no gap), slight vertical offset, tap-to-flip */}
        <div className="mt-10 flex items-start sm:hidden">
          <HexHalfFlip
            statement={MISSION}
            tone="yellow"
            point="left"
            className="flex-1 -translate-y-2"
          />
          <HexHalfFlip
            statement={VISION}
            tone="grey"
            point="right"
            className="flex-1 translate-y-3"
          />
        </div>
      </div>
    </section>
  );
}

/** Desktop trapezoid clip-path — a gentle single-side diagonal cut. */
function trapezoidClip(lean: "left" | "right") {
  return lean === "right"
    ? "polygon(0 0, 100% 0, 94% 100%, 0 100%)"
    : "polygon(6% 0, 100% 0, 100% 100%, 0 100%)";
}

/**
 * Half of a real hexagon — same 25%/75% breakpoints as EtnBanner's own
 * <Hexagon> — split down the middle. "left" = the hexagon's left half —
 * pointed tip on the left (outward), flat cut edge on the right (flush
 * against the other half, no gap). "right" mirrors that for the hexagon's
 * right half.
 */
function hexHalfClip(point: "left" | "right") {
  return point === "left"
    ? "polygon(25% 0%, 100% 0%, 100% 100%, 25% 100%, 0% 50%)"
    : "polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)";
}

function toneClasses(tone: "yellow" | "grey") {
  return tone === "yellow"
    ? "bg-yellow text-on-yellow"
    : "bg-[#F2F2F0] text-[#1C1C1E]";
}

/** Desktop: always-expanded trapezoid, full statement visible. */
function TrapezoidStatic({
  statement,
  tone,
  lean,
  className = "",
  paddingLeftClass = "pl-8",
}: {
  statement: Statement;
  tone: "yellow" | "grey";
  lean: "left" | "right";
  className?: string;
  /** Override left padding independently of right/vertical padding — useful when a
   * neighboring card's diagonal edge cuts into this card's visual space (e.g. Vision
   * sitting -ml-3 next to Mission's slanted edge needs extra breathing room). */
  paddingLeftClass?: string;
}) {
  return (
    <div
      className={`flex flex-col justify-center py-9 pr-8 ${paddingLeftClass} ${toneClasses(tone)} ${className}`}
      style={{ clipPath: trapezoidClip(lean) }}
    >
      <span className="mb-2 text-[11px] font-bold uppercase tracking-widest opacity-60">
        {statement.label}
      </span>
      <h3 className="text-2xl font-extrabold leading-tight">{statement.headline}</h3>
      <p className="mt-3 max-w-sm text-[14px] leading-relaxed opacity-85">{statement.body}</p>
    </div>
  );
}

/** Mobile: tap-to-flip hexagon half. Front = label + headline, back = full statement. */
function HexHalfFlip({
  statement,
  tone,
  point,
  className = "",
}: {
  statement: Statement;
  tone: "yellow" | "grey";
  point: "left" | "right";
  className?: string;
}) {
  const [flipped, setFlipped] = React.useState(false);
  const clip = hexHalfClip(point);
  /* Text box matches the hexagon's own geometry exactly: the point eats
     the first 25% of the card's width, so padding on that side is 25%
     (not a guessed fixed value) — text starts exactly where the taper
     ends and the shape becomes a full-height rectangle. */
  const textStyle: React.CSSProperties =
    point === "left" ? { paddingLeft: "25%", paddingRight: "8%" } : { paddingRight: "25%", paddingLeft: "8%" };

  return (
    <button
      type="button"
      aria-pressed={flipped}
      aria-label={`${statement.label}: ${
        flipped ? statement.body : `${statement.headline}. Tap to read more.`
      }`}
      onClick={() => setFlipped((f) => !f)}
      className={`relative h-60 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black ${className}`}
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 flex flex-col justify-center py-7 ${toneClasses(tone)}`}
          style={{ backfaceVisibility: "hidden", clipPath: clip, ...textStyle }}
        >
          <span className="mb-2 text-[11px] font-bold uppercase tracking-widest opacity-60">
            {statement.label}
          </span>
          <h3 className="text-xl font-extrabold leading-tight">{statement.headline}</h3>
          <span className="mt-3 text-[11px] opacity-55">↻ tap</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col justify-center bg-[#2A2A2E] py-7 text-[#F2F2F0]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            clipPath: clip,
            ...textStyle,
          }}
        >
          <span className="mb-2 text-[11px] font-bold uppercase tracking-widest opacity-60">
            {statement.label}
          </span>
          <p className="text-[13px] leading-relaxed opacity-90">{statement.body}</p>
        </div>
      </div>
    </button>
  );
}