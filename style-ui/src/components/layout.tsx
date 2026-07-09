"use client";
import * as React from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/**
 * Convention: Tailwind handles layout and spacing; MUI handles interactive
 * widgets. These three primitives are the only layout components — everything
 * else composes with Tailwind utilities.
 */

/**
 * The single horizontal width/padding rhythm for the whole app. Any element
 * that needs to align to the page's content column — the page shell, the
 * nav bar's inner row, full-bleed section content — uses this constant
 * instead of declaring its own max-width/padding. If the app's width or
 * padding ever needs to change, it changes here once.
 */
export const CONTAINER = "mx-auto w-[92%] max-w-[1400px] px-5 lg:px-10";

/** Mobile-first page shell: shared container width, vertical padding, safe-area insets. */
export function PageContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`${CONTAINER} py-5 lg:py-10 ${className}`}
      style={{
        paddingBottom: "calc(6rem + env(safe-area-inset-bottom))",
      }}
    >
      {children}
    </main>
  );
}

/** Section heading with optional eyebrow and trailing action. */
export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 mt-6 flex items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-grey-600">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-bold text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/** Settings-style tappable row with chevron. */
export function ListRow({
  icon,
  title,
  subtitle,
  onClick,
  trailing,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-(--radius-control) border border-grey-200 bg-surface px-4 py-3 text-left transition-colors hover:bg-grey-50 focus-visible:outline-2 focus-visible:outline-ink"
    >
      {icon && <span className="text-grey-700">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-ink">{title}</span>
        {subtitle && <span className="block truncate text-[13px] text-grey-600">{subtitle}</span>}
      </span>
      {trailing ?? <ChevronRightIcon fontSize="small" className="text-grey-400" />}
    </button>
  );
}