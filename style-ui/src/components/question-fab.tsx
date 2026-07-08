"use client";
import * as React from "react";
import Fab from "@mui/material/Fab";
import Zoom from "@mui/material/Zoom";
import Grow from "@mui/material/Grow";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { AiTag } from "./ai-tag";

/**
 * Floating action button pinned bottom-right, above the bottom nav.
 * Tap → expands into an anchored card with a textarea and submit.
 * Hide it on screens with a camera viewfinder (pass `hidden`).
 */
export function QuestionFab({
  onSubmit,
  hidden = false,
  sessionLabel,
}: {
  onSubmit: (question: string) => void | Promise<void>;
  hidden?: boolean;
  sessionLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const close = () => {
    setOpen(false);
    setText("");
  };

  const submit = async () => {
    const q = text.trim();
    if (!q) return;
    setSending(true);
    try {
      await onSubmit(q);
      close();
    } finally {
      setSending(false);
    }
  };

  if (hidden) return null;

  return (
    <div
      className="fixed right-4 z-50"
      style={{ bottom: "calc(76px + env(safe-area-inset-bottom))" }}
    >
      {open ? (
        <ClickAwayListener onClickAway={close}>
          <Grow in style={{ transformOrigin: "bottom right" }}>
            <div className="w-[min(88vw,340px)] rounded-(--radius-card) border border-grey-200 bg-surface p-4 shadow-[0_10px_30px_rgba(28,28,30,0.18)]">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[15px] font-semibold text-ink">Ask a question</p>
                <IconButton size="small" aria-label="Close" onClick={close}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </div>
              {sessionLabel && (
                <p className="mb-2 text-xs text-grey-600">For: {sessionLabel}</p>
              )}
              <TextField
                multiline
                minRows={3}
                autoFocus
                placeholder="Type your question for the speaker"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <AiTag label="Grouped with similar questions by AI" />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={submit}
                  disabled={!text.trim() || sending}
                >
                  {sending ? "Sending" : "Submit"}
                </Button>
              </div>
            </div>
          </Grow>
        </ClickAwayListener>
      ) : (
        <Zoom in>
          <Fab aria-label="Ask a question" onClick={() => setOpen(true)}>
            <QuestionAnswerRoundedIcon />
          </Fab>
        </Zoom>
      )}
    </div>
  );
}
