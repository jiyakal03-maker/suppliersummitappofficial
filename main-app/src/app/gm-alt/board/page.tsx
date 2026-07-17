"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@mui/material/Button";
import { BoardOnboardingTour } from "@/components/gm-alt/board-onboarding-tour";

/**
 * excalidraw-board.tsx has static top-level imports of Excalidraw's runtime
 * (convertToExcalidrawElements, exportToBlob, etc.) which reference window
 * at module-evaluation time — fine in the browser, but Next.js still
 * evaluates a "use client" component's module during server prerendering
 * unless the WHOLE module is loaded through a client-only dynamic import.
 * Wrapping just the inner <Excalidraw> tag (as excalidraw-board.tsx already
 * does) isn't enough; the module itself must never load on the server.
 */
const ExcalidrawBoard = dynamic(
  async () => (await import("@/components/gm-alt/excalidraw-board")).ExcalidrawBoard,
  { ssr: false }
);

/**
 * Route: /gm-alt/board?role=builder|spectator
 * Excalidraw-based backup of /growth-machine/board (tldraw version) — same
 * shell (Leave board button, role-driven canvas mode, onboarding tour),
 * different canvas implementation underneath. See excalidraw-board.tsx.
 */
function Board() {
  const router = useRouter();
  const role = useSearchParams().get("role") === "builder" ? "builder" : "spectator";
  const isBuilder = role === "builder";

  return (
    <div className="relative h-dvh w-dvw">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[400] flex justify-end p-3">
        <Button
          variant="contained"
          className="pointer-events-auto"
          data-tour="leave-board"
          onClick={() => router.push("/gm-alt")}
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

      <ExcalidrawBoard readOnly={!isBuilder} />
      <BoardOnboardingTour role={role} />
    </div>
  );
}

export default function GmAltBoardPage() {
  return (
    <React.Suspense fallback={null}>
      <Board />
    </React.Suspense>
  );
}
