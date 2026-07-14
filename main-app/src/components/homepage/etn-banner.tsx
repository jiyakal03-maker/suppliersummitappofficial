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

        {/* Hexagon cluster. Laid out with flex `gap` (not absolute
            percentages) so spacing is easy to tighten in one place. The
            stacked pair's flat top/bottom edges sit exactly `gap` apart,
            but the left hexagon meets them point-to-point — the pointed
            corners taper away from the gap, so an equal box-model gap reads
            as visibly wider there. The negative margin on the stacked
            column pulls it in to compensate, so both gaps read as the same
            width. */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Hexagon src="/Unit_1.png" alt="Road Maintenance & Transportation" className="h-[104px] w-[126px] sm:h-[136px] sm:w-[164px]" />
            <div className="-ml-4 flex flex-col gap-2 sm:-ml-5 sm:gap-2.5">
              <Hexagon src="/Unit_3.png" alt="Perforated Metal & Screen Solutions" className="h-[104px] w-[126px] sm:h-[136px] sm:w-[164px]" />
              <Hexagon src="/Unit_2.png" alt="Heavy Metal Fabrication" className="h-[104px] w-[126px] sm:h-[136px] sm:w-[164px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Renders a business-unit photo (/Unit_1.png etc.) that's already a
 * pre-clipped hexagon PNG (own border, transparent background) — not
 * clipped again here, since its hexagon is flat-top while this cluster's
 * layout is pointy-left/right; re-clipping would crop into its transparent
 * corners rather than the photo.
 */
function Hexagon({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`object-contain ${className}`} />;
}