"use client";
import * as React from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import LinearProgress from "@mui/material/LinearProgress";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";

/** Announcement banner (yellow tint, ink text). */
export function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-(--radius-control) bg-yellow-tint px-3.5 py-2.5">
      <CampaignRoundedIcon className="shrink-0 text-ink" sx={{ fontSize: 20 }} />
      <p className="text-[16px] font-medium text-grey-700">{children}</p>
    </div>
  );
}

/** Empty screen as an invitation to act. */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-(--radius-card) bg-grey-50 px-6 py-10 text-center">
      {icon && <span className="text-grey-400">{icon}</span>}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {body && <p className="max-w-xs text-sm text-grey-600">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Progress bar with a label and value readout. */
export function LabeledProgress({
  label,
  value,
  valueLabel,
}: {
  label: string;
  value: number;
  valueLabel?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-grey-700">{label}</span>
        <span className="text-sm font-semibold text-ink">{valueLabel ?? `${Math.round(value)}%`}</span>
      </div>
      <LinearProgress variant="determinate" value={value} aria-label={label} />
    </div>
  );
}

type ToastState = { open: boolean; message: string; severity: "success" | "error" | "info" };

/** App-standard toast: `const { toast, showToast } = useToast()` — render {toast}. */
export function useToast() {
  const [state, setState] = React.useState<ToastState>({ open: false, message: "", severity: "success" });
  const showToast = React.useCallback((message: string, severity: ToastState["severity"] = "success") => {
    setState({ open: true, message, severity });
  }, []);
  const toast = (
    <Snackbar
      open={state.open}
      autoHideDuration={3000}
      onClose={() => setState((s) => ({ ...s, open: false }))}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ bottom: { xs: "calc(76px + env(safe-area-inset-bottom))" } }}
    >
      <Alert severity={state.severity} variant="standard" onClose={() => setState((s) => ({ ...s, open: false }))}>
        {state.message}
      </Alert>
    </Snackbar>
  );
  return { toast, showToast };
}
