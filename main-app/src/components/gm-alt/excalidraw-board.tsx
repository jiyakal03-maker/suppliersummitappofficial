"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import Button from "@mui/material/Button";
import "@excalidraw/excalidraw/index.css";
import { convertToExcalidrawElements, exportToBlob, CaptureUpdateAction } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

/**
 * Excalidraw backup for components/text.tsx's tldraw-based GrowthMachine —
 * tldraw requires a paid license for production use; this is the same
 * feature set (Builder draws across 5 locked-heading prompts, Spectator
 * watches read-only with an ephemeral laser pointer) built on Excalidraw,
 * which is fully MIT-licensed, kept as a drop-in alternative under /gm-alt.
 *
 * Architecture differs from the tldraw version because Excalidraw has no
 * built-in "pages" concept — there's one canvas, and each prompt's elements
 * are just a plain array kept in React state. Switching prompts means
 * saving the current scene's elements into that prompt's slot, then
 * loading the next prompt's slot back onto the canvas via updateScene.
 * (`captureUpdate: CaptureUpdateAction.NEVER` since this is scene swapping,
 * not a user edit that should land on the undo stack.)
 *
 * <Excalidraw> is loaded via next/dynamic with ssr:false — it touches
 * window/canvas at module scope and isn't SSR-safe.
 */
const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, { ssr: false });

const PROMPT_HEADINGS = [
  "Engine: What drives growth?",
  "Fuel: What information or support is needed?",
  "Gears: How do we work together?",
  "Brakes: What slows us down?",
  "Turbo boost: What one big idea could accelerate growth?",
];
const PROMPT_COUNT = PROMPT_HEADINGS.length;

/** Centered on the origin so a fresh prompt's heading is always at a known,
 * stable spot — same reasoning as HEADING_BOUNDS in the tldraw version.
 * Sized to fit the longest heading ("Turbo boost: What one big idea could
 * accelerate growth?", 55 chars) on one line — a 700px box at fontSize 28
 * was too narrow for that one and the "Fuel" prompt, and the bound text
 * overflowed the container's edges rather than wrapping. */
function buildPromptElements(text: string): ExcalidrawElement[] {
  const elements = convertToExcalidrawElements([
    {
      type: "rectangle",
      x: -450,
      y: -60,
      width: 900,
      height: 120,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      locked: true,
      label: {
        text,
        fontSize: 22,
        textAlign: "center",
        verticalAlign: "middle",
      },
    },
  ]);
  // Force the bound label locked too — convertToExcalidrawElements doesn't
  // propagate `locked` from the container skeleton to the text it generates.
  return elements.map((el) => ({ ...el, locked: true }));
}

function BuilderFlow({ api }: { api: ExcalidrawImperativeAPI }) {
  const [promptSets, setPromptSets] = React.useState<ExcalidrawElement[][]>(() =>
    PROMPT_HEADINGS.map(buildPromptElements)
  );
  const [index, setIndex] = React.useState(0);
  const [mode, setMode] = React.useState<"editing" | "review">("editing");
  const [thumbnails, setThumbnails] = React.useState<Record<number, string>>({});
  const [generating, setGenerating] = React.useState(false);
  const framedOnce = React.useRef(false);

  React.useEffect(() => {
    if (framedOnce.current) return;
    framedOnce.current = true;
    let cancelled = false;

    // The heading's bound text is measured at buildPromptElements() time,
    // which can run before the Excalifont webfont has finished loading —
    // the box gets sized against a fallback font's metrics, so once the
    // real (wider) handwritten font paints in, the text reads as clipped/
    // cramped against the edges. Rebuilding once fonts are actually ready
    // re-measures against the real glyphs.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const fresh = PROMPT_HEADINGS.map(buildPromptElements);
      setPromptSets(fresh);

      // scrollToContent right after mount can fire before Excalidraw has
      // finished measuring its own container size — unlike goToPrompt's
      // later calls, which always land correctly since layout has settled
      // by the time the user interacts. Double rAF waits for that layout
      // pass before framing.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          api.updateScene({ elements: fresh[0], captureUpdate: CaptureUpdateAction.NEVER });
          api.scrollToContent(fresh[0], { fitToContent: true, animate: false });
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [api]);

  React.useEffect(() => {
    return () => {
      Object.values(thumbnails).forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToPrompt = (i: number, sets: ExcalidrawElement[][] = promptSets) => {
    setIndex(i);
    setMode("editing");
    api.updateScene({ elements: sets[i], captureUpdate: CaptureUpdateAction.NEVER });
    api.scrollToContent(sets[i], { fitToContent: true, animate: false });
  };

  const enterReview = async () => {
    const current = api.getSceneElements() as readonly ExcalidrawElement[];
    const sets = promptSets.map((els, i) => (i === index ? [...current] : els));
    setPromptSets(sets);

    setGenerating(true);
    const files = api.getFiles();
    const entries = await Promise.all(
      sets.map(async (els, i) => {
        const hasDrawing = els.some((el) => !el.locked);
        if (!hasDrawing) return [i, null] as const;
        const blob = await exportToBlob({
          elements: els,
          appState: { exportBackground: true, viewBackgroundColor: "#ffffff" },
          files,
        });
        return [i, URL.createObjectURL(blob)] as const;
      })
    );
    Object.values(thumbnails).forEach((url) => URL.revokeObjectURL(url));
    const next: Record<number, string> = {};
    for (const [i, url] of entries) {
      if (url) next[i] = url;
    }
    setThumbnails(next);
    setGenerating(false);
    setMode("review");
  };

  const submitPrompt = () => {
    const current = api.getSceneElements() as readonly ExcalidrawElement[];
    const sets = promptSets.map((els, i) => (i === index ? [...current] : els));
    setPromptSets(sets);
    if (index === PROMPT_COUNT - 1) {
      enterReview();
    } else {
      goToPrompt(index + 1, sets);
    }
  };

  if (mode === "review") {
    const allFilled = promptSets.every((_, i) => thumbnails[i]);
    return (
      <div className="pointer-events-auto fixed inset-0 z-[500] flex flex-col items-center justify-center overflow-auto bg-background p-6">
        <h1 className="text-center text-xl font-bold text-ink">Review your board</h1>
        <p className="mt-1 text-center text-sm text-grey-600">
          All 5 prompts, side by side — submit when you&apos;re happy with them.
        </p>
        <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {promptSets.map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-(--radius-card) border border-grey-200 bg-surface">
                {thumbnails[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnails[i]} alt={`Prompt ${i + 1}`} className="h-full w-full object-contain" />
                ) : (
                  <p className="px-3 text-center text-xs text-grey-500">Nothing drawn yet</p>
                )}
              </div>
              <p className="text-xs font-semibold text-ink">Prompt {i + 1}</p>
              <Button size="small" variant="text" color="secondary" onClick={() => goToPrompt(i)}>
                Edit
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-center gap-2">
          {!allFilled && (
            <p className="text-xs text-grey-500">Every prompt needs a drawing before you can submit.</p>
          )}
          <Button variant="contained" color="primary" disabled={!allFilled} onClick={() => alert("Board submitted!")}>
            Submit board
          </Button>
        </div>
      </div>
    );
  }

  const isLast = index === PROMPT_COUNT - 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 z-[400] flex justify-center" style={{ top: 64 }}>
      <div
        data-tour="prompt-banner"
        className="pointer-events-auto flex items-center gap-3 rounded-(--radius-card) bg-surface px-4 py-2 shadow-lg"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-grey-500">
          Prompt {index + 1} of {PROMPT_COUNT}
        </span>
        <span className="text-sm font-medium text-ink">Prompt {index + 1}</span>
        <Button size="small" variant="contained" color="primary" disabled={generating} onClick={submitPrompt}>
          {isLast ? (generating ? "Preparing…" : "Finish") : "Submit"}
        </Button>
      </div>
    </div>
  );
}

/**
 * `readOnly` maps to Excalidraw's own `viewModeEnabled` — its built-in
 * read-only mode (unlike tldraw, no separate `hideUi` needed; view mode
 * handles both). Spectators are set to the laser-pointer tool so they can
 * scribble an ephemeral trail — Excalidraw's laser is built for exactly
 * this (live presentation annotation), doesn't add scene elements, and
 * works under view mode.
 *
 * Same caveat as the tldraw version: no multiplayer sync backend here, so
 * Builder and Spectator each have their own local scene in their own
 * browser tab — a Spectator's laser trail only appears on their screen.
 */
export function ExcalidrawBoard({ readOnly = false }: { readOnly?: boolean }) {
  const [api, setApi] = React.useState<ExcalidrawImperativeAPI | null>(null);
  const initialElements = React.useMemo(() => buildPromptElements(PROMPT_HEADINGS[0]), []);

  React.useEffect(() => {
    // Calling imperative API methods synchronously inside the excalidrawAPI
    // callback itself fires before Excalidraw's own App component has
    // finished mounting ("Can't call setState on a component that is not
    // yet mounted") — deferring to an effect lets that mount complete first.
    if (readOnly && api) api.setActiveTool({ type: "laser" });
  }, [readOnly, api]);

  React.useEffect(() => {
    // Spectators never mount BuilderFlow, so its font/layout-timing fixes
    // don't apply to them — this is the same fix, scoped to the one
    // heading Spectators ever see (see BuilderFlow's version for the
    // full explanation).
    if (!readOnly || !api) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const fresh = buildPromptElements(PROMPT_HEADINGS[0]);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          api.updateScene({ elements: fresh, captureUpdate: CaptureUpdateAction.NEVER });
          api.scrollToContent(fresh, { fitToContent: true, animate: false });
        });
      });
    });
    return () => {
      cancelled = true;
    };
  }, [readOnly, api]);

  return (
    <div className="gm-alt-canvas" style={{ position: "fixed", inset: 0 }}>
      {/* Excalidraw has no `components` override like tldraw's — repositioning
          the toolbar and hiding the main-menu (hamburger) button means
          targeting its own stable class names directly. Scoped under
          .gm-alt-canvas so it can't leak into any other Excalidraw instance. */}
      <style>{`
        .gm-alt-canvas .main-menu-trigger {
          display: none !important;
        }
        .gm-alt-canvas .App-toolbar-container {
          position: fixed !important;
          top: auto !important;
          bottom: 16px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
        }
      `}</style>
      <Excalidraw
        viewModeEnabled={readOnly}
        initialData={{ elements: initialElements, appState: { viewBackgroundColor: "#ffffff" } }}
        excalidrawAPI={(a: ExcalidrawImperativeAPI) => setApi(a)}
      />
      {!readOnly && api && <BuilderFlow api={api} />}
    </div>
  );
}
