"use client";
import * as React from "react";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import ThumbUpOffAltRoundedIcon from "@mui/icons-material/ThumbUpOffAltRounded";
import { AiTag } from "./ai-tag";

/**
 * Submitted question. Attendee view: upvote toggle. Speaker view: pass
 * `groupCount` to show "N similar" (AI grouping) — ranked lists sort by votes.
 */
export function QuestionCard({
  text,
  votes,
  upvoted,
  onToggleUpvote,
  groupCount,
}: {
  text: string;
  votes: number;
  upvoted?: boolean;
  onToggleUpvote?: () => void;
  groupCount?: number;
}) {
  return (
    <Card className="flex items-start gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] leading-relaxed text-ink">{text}</p>
        {groupCount != null && groupCount > 1 && (
          <div className="mt-2 flex items-center gap-2">
            <Chip size="small" label={`${groupCount} similar`} />
            <AiTag label="Grouped by AI" detail="Similar questions are clustered automatically so speakers can answer the theme once." />
          </div>
        )}
      </div>
      <div className="flex flex-col items-center">
        <IconButton
          aria-label={upvoted ? "Remove upvote" : "Upvote question"}
          onClick={onToggleUpvote}
          size="small"
          className={upvoted ? "bg-yellow text-on-yellow" : "text-grey-600"}
        >
          {upvoted ? <ThumbUpAltRoundedIcon fontSize="small" /> : <ThumbUpOffAltRoundedIcon fontSize="small" />}
        </IconButton>
        <span className="text-xs font-semibold text-ink">{votes}</span>
      </div>
    </Card>
  );
}
