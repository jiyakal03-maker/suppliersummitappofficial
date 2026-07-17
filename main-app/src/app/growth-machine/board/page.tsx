"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@mui/material/Button";
import { GrowthMachine, BoardOnboardingTour } from "@/components";

/**
 * Route: /growth-machine/board?role=builder|spectator
 * The real collaborative canvas, reached only after picking a role on
 * /growth-machine. Builder can draw; anything else (missing/invalid param,
 * someone linking in directly) falls back to Spectator — the safer default
 * for an unauthenticated role param.
 */
function Board() {
  const router = useRouter();
  const role = useSearchParams().get("role") === "builder" ? "builder" : "spectator";
  const isBuilder = role === "builder";

  return (
    <div className="relative h-dvh w-dvw">
      {/* z-[400]: tldraw's own panels sit at z-index 300 (--tl-layer-panels
          in tldraw.css) — anything lower here renders BEHIND them instead
          of staying visible on top. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[400] flex justify-end p-3">
        <Button
          variant="contained"
          className="pointer-events-auto"
          data-tour="leave-board"
          onClick={() => router.push("/growth-machine")}
          sx={{
            bgcolor: "#000",
            color: "#fff",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            "&:hover": {
              bgcolor: "#000",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
            },
          }}
        >
          Leave board
        </Button>
      </div>

      <GrowthMachine readOnly={!isBuilder} />
      <BoardOnboardingTour role={role} />
    </div>
  );
}

export default function GrowthMachineBoardPage() {
  return (
    <React.Suspense fallback={null}>
      <Board />
    </React.Suspense>
  );
}
