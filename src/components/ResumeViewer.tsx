"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowSquareOut, DownloadSimple, MagnifyingGlassMinus, MagnifyingGlassPlus, ArrowsIn, X } from "@phosphor-icons/react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { site } from "@/data/site";

type Status = "loading" | "ready" | "error";
const MIN = 0.5;
const MAX = 3;
const STEP = 0.25;
const MAX_PAGE_WIDTH = 820; // "Fit" never stretches the page wider than this on large screens.

const btn = "inline-flex h-10 min-w-10 items-center justify-center gap-2 border border-line px-3 text-sm transition-colors hover:border-fg disabled:opacity-40 disabled:hover:border-line";
const noop = () => () => {};

export default function ResumeViewer({ src, downloadName, onClose }: { src: string; downloadName: string; onClose: () => void }) {
  const root = useSyncExternalStore(noop, () => document.body, () => null);
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);

  // Escape closes (before other handlers such as the chat panel), Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === "Tab" && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex='0']")];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (!panel.current.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  // Lock background scroll and move focus into the dialog while it is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Load pdf.js lazily and open the document.
  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        task = pdfjs.getDocument({ url: src });
        const d = await task.promise;
        if (cancelled) return;
        setDoc(d);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [src]);

  // Track the scroll area width (resize/rotate only, never on scroll).
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [status]);

  // Render every page whenever the document, zoom or width changes.
  useEffect(() => {
    if (!doc || !width) return;
    const tasks: RenderTask[] = [];
    let stale = false;
    (async () => {
      const base = Math.min(width - 32, MAX_PAGE_WIDTH);
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        const canvas = canvases.current[n - 1];
        if (stale || !canvas) return;
        const scale = (base / page.getViewport({ scale: 1 }).width) * zoom;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const vp = page.getViewport({ scale: scale * dpr });
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        canvas.style.width = `${Math.floor(vp.width / dpr)}px`;
        canvas.style.height = `${Math.floor(vp.height / dpr)}px`;
        const task = page.render({ canvas, viewport: vp });
        tasks.push(task);
        try {
          await task.promise;
        } catch {
          return; // cancelled by a newer render
        }
      }
    })();
    return () => {
      stale = true;
      tasks.forEach((t) => t.cancel());
    };
  }, [doc, zoom, width]);

  const bump = useCallback((d: number) => setZoom((z) => Math.min(MAX, Math.max(MIN, Math.round((z + d) * 100) / 100))), []);

  if (!root) return null;
  return createPortal(
    <div
      className="fadein fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm md:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-title"
        className="mx-auto flex h-full max-w-[1100px] flex-col border-line bg-bg md:border"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <h2 id="resume-title" className="truncate font-medium">{site.name}</h2>
            <p className="label uppercase">Resume</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={src}
              download={downloadName}
              className="inline-flex h-10 items-center gap-2 whitespace-nowrap bg-accent px-4 text-sm font-medium text-accent-ink transition-transform hover:-translate-y-px active:translate-y-px"
            >
              <DownloadSimple size={18} /> Download PDF
            </a>
            <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close resume viewer" className={btn}>
              <X size={18} />
            </button>
          </div>
        </header>

        <div role="toolbar" aria-label="Resume view controls" className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => bump(-STEP)} disabled={zoom <= MIN} aria-label="Zoom out" className={btn}><MagnifyingGlassMinus size={18} /></button>
            <span className="label w-12 text-center" aria-live="polite">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => bump(STEP)} disabled={zoom >= MAX} aria-label="Zoom in" className={btn}><MagnifyingGlassPlus size={18} /></button>
            <button type="button" onClick={() => setZoom(1)} aria-label="Fit to page width" className={btn}><ArrowsIn size={18} /> <span className="hidden sm:inline">Fit</span></button>
          </div>
          <a href={src} target="_blank" rel="noreferrer" className={btn}>
            <ArrowSquareOut size={18} /> <span className="hidden sm:inline">Open in new tab</span><span className="sr-only sm:hidden">Open in new tab</span>
          </a>
        </div>

        <div ref={scroller} tabIndex={0} aria-label="Resume pages" className="min-h-0 flex-1 overflow-auto bg-surface py-4">
          {status === "loading" && <p role="status" className="label px-4 py-16 text-center">Loading resume...</p>}
          {status === "error" && (
            <div role="alert" className="mx-auto max-w-[44ch] px-4 py-16 text-center">
              <p className="font-medium">The resume could not be displayed here.</p>
              <p className="mt-2 text-muted">You can still open or download the original PDF.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <a href={src} target="_blank" rel="noreferrer" className={btn}>Open in new tab</a>
                <a href={src} download={downloadName} className={btn}>Download PDF</a>
              </div>
            </div>
          )}
          {status === "ready" && doc && (
            <div className="flex w-max min-w-full flex-col items-center gap-4 px-4">
              {Array.from({ length: doc.numPages }, (_, i) => (
                <canvas
                  key={i}
                  ref={(el) => {
                    canvases.current[i] = el;
                  }}
                  role="img"
                  aria-label={`Resume page ${i + 1} of ${doc.numPages}`}
                  className="max-w-none bg-white shadow-[0_2px_24px_rgb(0_0_0/0.35)]"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    root,
  );
}
