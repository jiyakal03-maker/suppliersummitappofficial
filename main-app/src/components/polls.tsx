"use client";
import * as React from "react";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

/**
 * Live poll. Before voting: tappable options. After voting (or when
 * `showResults`): yellow result bars on a grey track with percentages.
 */
export function PollCard({
  question,
  options,
  live,
  votedId,
  showResults,
  onVote,
}: {
  question: string;
  options: PollOption[];
  live?: boolean;
  votedId?: string | null;
  showResults?: boolean;
  onVote?: (optionId: string) => void;
}) {
  const total = Math.max(
    1,
    options.reduce((s, o) => s + o.votes, 0)
  );
  const revealed = Boolean(votedId) || showResults;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-semibold leading-snug text-ink">{question}</p>
        {live && <Chip size="small" color="primary" label="Live" />}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {options.map((o) => {
          const pct = Math.round((o.votes / total) * 100);
          const mine = votedId === o.id;
          return revealed ? (
            <div key={o.id} className="relative overflow-hidden rounded-(--radius-control) border border-grey-200">
              <div
                className="absolute inset-y-0 left-0 bg-yellow dark:bg-yellow/35"
                style={{ width: `${pct}%` }}
                aria-hidden
              />
              <div className="relative flex items-center justify-between px-3 py-2 text-[14px]">
                <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                  {o.label}
                  {mine && <CheckRoundedIcon sx={{ fontSize: 16 }} />}
                </span>
                <span className="font-semibold text-ink">{pct}%</span>
              </div>
            </div>
          ) : (
            <button
              key={o.id}
              type="button"
              onClick={() => onVote?.(o.id)}
              className="rounded-(--radius-control) border border-grey-300 px-3 py-2 text-left text-[14px] font-medium text-ink transition-colors hover:border-ink hover:bg-grey-50 focus-visible:outline-2 focus-visible:outline-ink"
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {revealed && (
        <p className="mt-2 text-xs text-grey-600">
          {options.reduce((s, o) => s + o.votes, 0)} responses
        </p>
      )}
    </Card>
  );
}
