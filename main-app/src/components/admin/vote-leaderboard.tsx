"use client";
import * as React from "react";
import Card from "@mui/material/Card";

export interface VoteEntry {
  id: string;
  label: string;
  votes: number;
}

/** Ranked leaderboard — rank badge, label, vote count, and a magnitude bar relative to the leader. */
export function VoteLeaderboard({ title, entries }: { title: string; entries: VoteEntry[] }) {
  const ranked = [...entries].sort((a, b) => b.votes - a.votes);
  const max = Math.max(1, ...ranked.map((e) => e.votes));
  const total = ranked.reduce((s, e) => s + e.votes, 0);

  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        <span className="text-xs text-grey-600">{total} votes</span>
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {ranked.map((entry, idx) => {
          const pct = Math.round((entry.votes / max) * 100);
          return (
            <div key={entry.id} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  idx === 0 ? "bg-yellow text-on-yellow" : "bg-grey-100 text-grey-700"
                }`}
              >
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-medium text-ink">{entry.label}</span>
                  <span className="shrink-0 text-[13px] font-semibold text-ink">{entry.votes}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-grey-100">
                  <div
                    className="h-full rounded-full bg-yellow transition-[width]"
                    style={{ width: `${pct}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
