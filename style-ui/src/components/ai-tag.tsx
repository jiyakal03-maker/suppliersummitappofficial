"use client";
import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

/**
 * Transparency chip for anything AI-assisted (session summaries, question
 * grouping). Satisfies the project's "user trust" constraint: make explicit
 * when AI is used and for what.
 */
export function AiTag({
  label = "AI-generated",
  detail,
}: {
  label?: string;
  detail?: string;
}) {
  const chip = (
    <span className="inline-flex items-center gap-1 rounded-full bg-grey-100 px-2 py-0.5 text-[11px] font-semibold text-grey-700">
      <AutoAwesomeRoundedIcon sx={{ fontSize: 13 }} />
      {label}
    </span>
  );
  return detail ? <Tooltip title={detail}>{chip}</Tooltip> : chip;
}
