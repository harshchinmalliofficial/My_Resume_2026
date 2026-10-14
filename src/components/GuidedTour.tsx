"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, SkipForward, X } from "@phosphor-icons/react";
import { tours, type TourLink } from "@/content/tour";
import { tourDone } from "@/content/personality";
import { emit } from "@/lib/personality/bus";
import { nextMessage } from "@/lib/personality/messages";

const btn = "inline-flex h-10 items-center justify-center gap-1.5 border border-line px-3 text-sm transition-colors hover:border-fg disabled:opacity-40 disabled:hover:border-line";

// A visitor-started, finite walk through real sections. Non-modal: the page stays usable and nothing is dimmed.
export default function GuidedTour({ mode, onExit }: { mode: "quick" | "deep"; onExit: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const card = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const tour = tours[mode];
  const steps = tour.steps;
  const s = steps[step];
  const home = pathname === "/";
  const last = step === steps.length - 1;

  // Started from another page: go home first (the host is mounted in the layout, so this state survives).
  useEffect(() => {
    if (!home) router.push("/");
  }, [home, router]);

  // Highlight and scroll to the current section. Reduced motion jumps instead of gliding.
  useEffect(() => {
    if (!home) return;
    const el = s.target ? document.getElementById(s.target) : null;
    el?.setAttribute("data-tour-active", "");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    return () => el?.removeAttribute("data-tour-active");
  }, [home, s.target]);

  // Focus the card when it appears and on every step, so keyboard and screen reader users follow along.
  useEffect(() => {
    if (home) card.current?.focus({ preventScroll: true });
  }, [home, step]);

  // Escape exits only while focus is inside the card, so it never competes with other dialogs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && card.current?.contains(document.activeElement)) onExit();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onExit]);

  const finish = () => {
    const m = nextMessage("tour-done", tourDone);
    onExit();
    emit({ type: "tour-finished" });
    if (m) window.setTimeout(() => emit({ type: "robot", pose: "celebrate", say: { id: m.id, text: m.text, force: true } }), 300);
  };

  const follow = (l: TourLink) => {
    if (l.action === "resume") emit({ type: "open-resume" });
  };

  if (!home) return null;
  return (
    <div
      ref={card}
      role="dialog"
      aria-modal="false"
      aria-labelledby="tour-title"
      tabIndex={-1}
      className="fadein fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[45] border border-line bg-surface p-4 shadow-[0_8px_32px_rgb(0_0_0/0.4)] outline-none sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[24rem] md:left-8"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="label uppercase !text-accent">{tour.name} · {step + 1} of {steps.length}</p>
        <button type="button" onClick={onExit} aria-label="Exit tour" className="-m-2 p-2 text-muted hover:text-fg">
          <X size={16} />
        </button>
      </div>
      <h2 id="tour-title" className="mt-2 font-medium">{s.title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted" aria-live="polite">{s.body}</p>
      {s.links && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {s.links.map((l) => (
            <li key={l.label}>
              {l.action ? (
                <button type="button" onClick={() => follow(l)} className="text-sm text-accent underline underline-offset-4">{l.label}</button>
              ) : (
                <a href={l.href} {...(/^https?:/.test(l.href!) ? { target: "_blank", rel: "noreferrer" } : {})} className="text-sm text-accent underline underline-offset-4">{l.label}</a>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0} className={btn}>
          <ArrowLeft size={16} /> Back
        </button>
        {last ? (
          <button type="button" onClick={finish} className="inline-flex h-10 items-center bg-accent px-4 text-sm font-medium text-accent-ink">Finish</button>
        ) : (
          <button type="button" onClick={() => setStep((n) => n + 1)} className="inline-flex h-10 items-center gap-1.5 bg-accent px-4 text-sm font-medium text-accent-ink">
            Next <ArrowRight size={16} />
          </button>
        )}
        {!last && (
          <button type="button" onClick={() => setStep(steps.length - 1)} className={btn}>
            <SkipForward size={16} /> Skip
          </button>
        )}
        <button type="button" onClick={onExit} className={`${btn} ml-auto`}>Exit</button>
      </div>
    </div>
  );
}
