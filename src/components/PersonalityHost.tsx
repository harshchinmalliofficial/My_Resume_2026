"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { rules } from "@/content/personality";
import { emit, subscribe } from "@/lib/personality/bus";

// Optional experiences load only when opened, so the initial bundle is unchanged.
const DevConsole = dynamic(() => import("./DevConsole"), { ssr: false });
const GuidedTour = dynamic(() => import("./GuidedTour"), { ssr: false });

type Toast = { id: number; text: string; tone: "ok" | "error" };
const editable = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
};

// Mounted once in the layout: toasts, the developer console, the tour, and the console keyboard shortcut.
export function PersonalityHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [console_, setConsole] = useState(false);
  const [tour, setTour] = useState<"quick" | "deep" | null>(null);
  const closeConsole = useCallback(() => setConsole(false), []);
  const exitTour = useCallback(() => setTour(null), []);

  useEffect(
    () =>
      subscribe((e) => {
        if (e.type === "toast") {
          const id = Date.now() + Math.random();
          setToasts((t) => [...t.slice(-2), { id, text: e.text, tone: e.tone ?? "ok" }]);
          window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), rules.toastMs);
        }
        if (e.type === "open-console") setConsole(true);
        if (e.type === "tour") setTour(e.mode);
      }),
    [],
  );

  // Ctrl/Cmd + Shift + K. Ignored while typing, and it never fires without both modifiers.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "k" || !e.shiftKey || !(e.ctrlKey || e.metaKey) || e.altKey || editable(e.target)) return;
      e.preventDefault();
      emit({ type: "open-console" });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {console_ && <DevConsole onClose={closeConsole} />}
      {tour && <GuidedTour mode={tour} onExit={exitTour} />}
      <div className={`pointer-events-none fixed inset-x-3 z-[65] flex flex-col items-center gap-2 sm:items-start md:left-8 md:right-auto ${tour ? "bottom-72 sm:bottom-80" : "bottom-[max(0.75rem,env(safe-area-inset-bottom))]"}`}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={`fadein pointer-events-auto flex max-w-[26rem] items-start gap-3 border bg-surface px-4 py-3 text-sm shadow-[0_6px_24px_rgb(0_0_0/0.35)] ${t.tone === "error" ? "border-accent" : "border-line"}`}
          >
            <p className="min-w-0 flex-1">{t.text}</p>
            <button type="button" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} aria-label="Dismiss" className="-m-1 p-1 text-muted hover:text-fg">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
