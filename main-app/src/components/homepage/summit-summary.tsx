"use client";
import * as React from "react";

/**
 * Top-of-homepage welcome banner: personalized greeting, summit subheading,
 * and a row of light-yellow stat tiles (attendees, speakers, sessions, etc).
 */
export function SummitSummary({
  name,
  stats,
}: {
  name: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <section className="border-b border-grey-200 pb-6 lg:pb-8">
      <h1 className="text-2xl font-bold text-ink">
        Welcome back {name} to the Supplier Summit 2026
      </h1>
      <p className="mt-1 text-sm text-grey-600">
        Two days of keynotes, roadmap sessions, and supplier collaboration.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-(--radius-card) bg-yellow-tint px-4 py-5 text-center"
          >
            <p className="text-2xl font-bold text-ink">{stat.value}</p>
            <p className="mt-0.5 text-xs text-grey-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
