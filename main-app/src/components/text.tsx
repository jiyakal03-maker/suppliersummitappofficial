"use client"
import * as React from 'react'
import type { ComponentProps } from 'react'
import {
  Tldraw,
  DefaultStylePanel,
  DefaultToolbar,
  TldrawImage,
  type Editor,
  type TLComponents,
  type TLPageId,
  type TLEditorSnapshot,
} from 'tldraw'
import 'tldraw/tldraw.css'
import Button from '@mui/material/Button'

/**
 * tldraw's own panels default to top-right (style panel) and bottom-center
 * (toolbar) via its internal CSS grid — that grid isn't meant to be fought
 * with overrides, so these reposition the DEFAULT panel content inside a
 * plain fixed-position wrapper instead, which is tldraw's documented way to
 * relocate a built-in panel (`components` prop below).
 */
function RepositionedStylePanel(props: ComponentProps<typeof DefaultStylePanel>) {
  return (
    <div style={{ position: 'fixed', top: '50%', right: 8, transform: 'translateY(-50%)', pointerEvents: 'all' }}>
      <DefaultStylePanel {...props} />
    </div>
  )
}

function RepositionedToolbar(props: ComponentProps<typeof DefaultToolbar>) {
  return (
    <div style={{ position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'all' }}>
      <DefaultToolbar {...props} />
    </div>
  )
}

// Module-level, not recreated per render — tldraw's `components` prop must
// be a stable reference (it's read once on mount).
const components: TLComponents = {
  StylePanel: RepositionedStylePanel,
  Toolbar: RepositionedToolbar,
}

const PROMPT_COUNT = 5

/**
 * Builder-only flow: 5 tldraw pages, one per "prompt" (placeholder copy for
 * now — just "Prompt 1".."Prompt 5", real prompt content comes later). A
 * Submit button advances through them in page order; after the 5th, swaps
 * the live canvas for a static side-by-side review of all 5 pages (via
 * TldrawImage — a snapshot render, not the live editor) before one final
 * submit. Runs once the store has settled to exactly these 5 pages, so a
 * fresh mount (no persistence configured, so always starts from tldraw's
 * single default page) just needs 4 more created.
 */
function BuilderFlow({ editor }: { editor: Editor }) {
  const [pageIds, setPageIds] = React.useState<TLPageId[] | null>(null);
  const [index, setIndex] = React.useState(0);
  const [reviewSnapshot, setReviewSnapshot] = React.useState<TLEditorSnapshot | null>(null);
  const setupRan = React.useRef(false);

  React.useEffect(() => {
    if (setupRan.current) return;
    setupRan.current = true;

    const existing = editor.getPages();
    for (let i = 0; i < PROMPT_COUNT; i++) {
      const label = `Prompt ${i + 1}`;
      if (existing[i]) {
        if (existing[i].name !== label) editor.renamePage(existing[i].id, label);
      } else {
        editor.createPage({ name: label });
      }
    }
    const ids = editor.getPages().slice(0, PROMPT_COUNT).map((p) => p.id);
    setPageIds(ids);
    editor.setCurrentPage(ids[0]);
  }, [editor]);

  if (!pageIds) return null;

  if (reviewSnapshot) {
    return (
      <div className="pointer-events-auto fixed inset-0 z-[500] overflow-auto bg-background p-6">
        <h1 className="text-center text-xl font-bold text-ink">Review your board</h1>
        <p className="mt-1 text-center text-sm text-grey-600">
          All 5 prompts, side by side — submit when you&apos;re happy with them.
        </p>
        <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {pageIds.map((id, i) => (
            <div key={id} className="flex flex-col items-center gap-2">
              <div className="aspect-square w-full overflow-hidden rounded-(--radius-card) border border-grey-200 bg-surface">
                <TldrawImage snapshot={reviewSnapshot} pageId={id} />
              </div>
              <p className="text-xs font-semibold text-ink">Prompt {i + 1}</p>
              <Button
                size="small"
                variant="text"
                color="secondary"
                onClick={() => {
                  editor.setCurrentPage(id);
                  setIndex(i);
                  setReviewSnapshot(null);
                }}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Button variant="contained" color="primary" onClick={() => alert('Board submitted!')}>
            Submit board
          </Button>
        </div>
      </div>
    );
  }

  const isLast = index === PROMPT_COUNT - 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 z-[400] flex justify-center" style={{ top: 64 }}>
      <div className="pointer-events-auto flex items-center gap-3 rounded-(--radius-card) bg-surface px-4 py-2 shadow-lg">
        <span className="text-xs font-semibold uppercase tracking-wide text-grey-500">
          Prompt {index + 1} of {PROMPT_COUNT}
        </span>
        <span className="text-sm font-medium text-ink">Prompt {index + 1}</span>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => {
            if (isLast) {
              setReviewSnapshot(editor.getSnapshot());
            } else {
              const next = index + 1;
              editor.setCurrentPage(pageIds[next]);
              setIndex(next);
            }
          }}
        >
          {isLast ? 'Finish' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}

/**
 * Shared collaborative canvas for /growth-machine/board. `readOnly` is set
 * once on mount via `editor.updateInstanceState` — tldraw's documented way
 * to put the editor in view-only mode (no shape creation/editing, no
 * toolbar actions), used for Spectators so only the Builder can draw.
 * `hideUi` also hides the (repositioned) panels entirely for Spectators.
 * BuilderFlow (the 5-prompt stepper + review) only mounts when NOT
 * readOnly — Spectators just watch whatever page the Builder has open.
 */
export function GrowthMachine({ readOnly = false }: { readOnly?: boolean }) {
  const [editor, setEditor] = React.useState<Editor | null>(null);

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        hideUi={readOnly}
        components={components}
        onMount={(ed: Editor) => {
          ed.updateInstanceState({ isReadonly: readOnly });
          setEditor(ed);
        }}
      />
      {!readOnly && editor && <BuilderFlow editor={editor} />}
    </div>
  );
}
