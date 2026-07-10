"use client";
import * as React from "react";
import { CONTAINER } from "../layout";

/**
 * About Us — Comp 1. Opening beat of the About Us scroll, following the
 * source Etnyre title slide layout:
 *  - "Etnyre" is the small wordmark/label near the hexagon cluster
 *    (business unit level)
 *  - "Etnyre International" is the larger heading below/beside it
 *    (parent brand level)
 *
 * Deliberate contrast moment: colors are INVERTED from the page's current
 * mode (not matched to it) so this band visually interrupts the scroll —
 * light mode page -> black band here; dark mode page -> light grey band.
 *
 * Full-bleed: the background spans the full viewport width, breaking out
 * of PageContainer's max-w-xl constraint, while the inner content (text,
 * hexagons) stays aligned to that same max-w-xl indentation.
 *
 * Desktop: side-by-side, text left / hexagons right, matching the slide.
 * Mobile: vertical stack — hexagon cluster (with "Etnyre" label) first,
 * then "Etnyre International" heading + address below.
 */
export function EtnBanner() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] mt-6 w-screen bg-black dark:bg-[#2A2A2E]">
      <div className={`${CONTAINER} flex flex-col-reverse items-center gap-8 py-12 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:py-16`}>
        <div className="w-full text-center sm:w-auto sm:text-left">
          <h2 className="text-[32px] font-medium tracking-tight text-[#F2F2F0] dark:text-[#F2F2F0] sm:text-[38px]">
            Etnyre International
          </h2>
          <p className="mt-3 text-sm text-[#A9A8AC] dark:text-[#F2F2F0]">
            Family Owned Since 1898
          </p>
          <p className="mt-6 text-xs leading-relaxed text-[#8A898B] dark:text-[#F2F2F0]">
            1333 S. Daysville Road
            <br />
            Oregon, IL 61061
          </p>
        </div>

        {/* Hexagon cluster with "Etnyre" business-unit label */}
        <div className="relative h-[180px] w-[210px] shrink-0 sm:h-[240px] sm:w-[260px]">
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-wide text-[#F2F2F0] dark:text-[#F2F2F0] sm:left-0 sm:translate-x-0">
            Etnyre
          </span>
          <Hexagon className="absolute left-0 top-[38%] h-[42%] w-[46%]" />
          <Hexagon className="absolute right-0 top-0 h-[42%] w-[46%]" />
          <Hexagon className="absolute bottom-0 right-0 h-[42%] w-[46%]" />
        </div>
      </div>
    </section>
  );
}

function Hexagon({ className = "" }: { className?: string }) {
  return (
    <div
      className={`border-2 border-yellow bg-[#6B6A6C] ${className}`}
      style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}
    />
  );
}