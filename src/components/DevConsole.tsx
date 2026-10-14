"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "@phosphor-icons/react";
import { capabilities, certifications, experience } from "@/data/profile";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { strings } from "@/content/personality";
import { emit } from "@/lib/personality/bus";
import { COMMANDS, parseCommand, suggest, type CommandName } from "@/lib/personality/commands";

type Line = { kind: "in" | "out" | "err" | "link"; text: string; href?: string };
const noop = () => () => {};
const out = (...t: string[]): Line[] => t.map((text) => ({ kind: "out", text }));

// Every command only reads public portfolio data or triggers an existing UI action. Nothing is evaluated.
function run(name: CommandName, args: string[]): { lines: Line[]; after?: "close" | "clear" } {
  switch (name) {
    case "help":
      return { lines: out("Available commands:", ...COMMANDS.map((c) => `  ${c}`)) };
    case "about":
      return { lines: [...out(site.name, site.headline, site.location), { kind: "link", text: "open the About section", href: "/#about" }] };
    case "projects": {
      const p = args[0] ? projects.find((x) => x.slug.includes(args[0]) || x.title.toLowerCase().includes(args[0])) : null;
      if (args[0] && !p) return { lines: [{ kind: "err", text: `No project matches "${args[0]}". Try: projects` }] };
      return { lines: (p ? [p] : projects).flatMap((x) => [{ kind: "link" as const, text: `${x.title}: ${x.quip}`, href: `/projects/${x.slug}` }]) };
    }
    case "skills":
      return { lines: [...capabilities.filter((c) => c.core).flatMap((c) => out(`${c.group}: ${c.items.join(", ")}`)), { kind: "link", text: "open all capabilities", href: "/#capabilities" }] };
    case "experience":
      return { lines: [...experience.flatMap((r) => out(`${r.company}, ${r.title} (${r.period})`)), { kind: "link", text: "open the Experience section", href: "/#experience" }] };
    case "certifications":
      return { lines: [...certifications.flatMap((c) => out(`${c.name} (${c.issuer})${c.status === "in-progress" ? ", in progress" : ""}`)), { kind: "link", text: "open certificates and badges", href: "/#credentials" }] };
    case "contact":
      return {
        lines: [
          { kind: "link", text: site.email, href: `mailto:${site.email}` },
          { kind: "link", text: "LinkedIn", href: site.linkedin },
          { kind: "link", text: "GitHub", href: site.github },
        ],
      };
    case "resume":
      return { lines: out("Opening the resume viewer."), after: "close" };
    case "tour":
      return { lines: out(`Starting the ${args[0] === "deep" ? "deep dive" : "quick tour"}.`), after: "close" };
    case "clear":
      return { lines: [], after: "clear" };
    case "exit":
      return { lines: [], after: "close" };
  }
}

export default function DevConsole({ onClose }: { onClose: () => void }) {
  const root = useSyncExternalStore(noop, () => document.body, () => null);
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>(() => out(strings.consoleHello));
  const [value, setValue] = useState("");

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    emit({ type: "modal", id: "console", open: true });
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === "Tab" && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input")];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prev;
      emit({ type: "modal", id: "console", open: false });
      opener?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [lines]);

  const submit = (raw: string) => {
    const parsed = parseCommand(raw);
    if (!raw.trim()) return;
    setValue("");
    if (!parsed.ok) {
      const s = suggest(raw);
      setLines((l) => [...l, { kind: "in", text: raw.slice(0, 60) }, { kind: "err", text: `Unknown command.${s ? ` Did you mean "${s}"?` : ""} Type help.` }]);
      return;
    }
    const r = run(parsed.name, parsed.args);
    setLines((l) => (r.after === "clear" ? [] : [...l, { kind: "in", text: parsed.name + (parsed.args.length ? ` ${parsed.args.join(" ")}` : "") }, ...r.lines]));
    if (r.after === "close") {
      onClose();
      // Let the console finish closing (and restore focus) before the next surface opens.
      if (parsed.name === "resume") window.setTimeout(() => emit({ type: "open-resume" }), 120);
      if (parsed.name === "tour") window.setTimeout(() => emit({ type: "tour", mode: parsed.args[0] === "deep" ? "deep" : "quick" }), 120);
    }
  };

  const link = (l: Line) => {
    const href = l.href!;
    const external = /^(https?:|mailto:)/.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        onClick={(e) => {
          if (external) return;
          e.preventDefault();
          onClose();
          router.push(href);
        }}
        className="text-accent underline underline-offset-4"
      >
        {l.text}
      </a>
    );
  };

  if (!root) return null;
  return createPortal(
    <div className="fadein fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm md:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="console-title"
        className="mx-auto flex h-full max-w-[760px] flex-col border-line bg-bg md:h-[min(34rem,100%)] md:border"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 id="console-title" className="font-medium">Developer mode</h2>
            <p className="label uppercase">Simulated console, read-only</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close developer mode" className="inline-flex size-10 items-center justify-center border border-line hover:border-fg">
            <X size={18} />
          </button>
        </header>

        <div ref={log} role="log" aria-live="polite" aria-label="Console output" className="min-h-0 flex-1 overflow-auto px-4 py-3 font-mono text-[0.82rem] leading-relaxed">
          {lines.map((l, i) => (
            <p key={i} className={`whitespace-pre-wrap break-words ${l.kind === "in" ? "text-fg" : l.kind === "err" ? "text-accent" : "text-muted"}`}>
              {l.kind === "in" && <span className="text-accent">$ </span>}
              {l.kind === "link" ? link(l) : l.text}
            </p>
          ))}
        </div>

        <div className="border-t border-line p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {COMMANDS.filter((c) => c !== "exit").map((c) => (
              <button key={c} type="button" onClick={() => submit(c)} className="h-9 border border-line px-3 font-mono text-xs transition-colors hover:border-fg">
                {c}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
            className="flex items-center gap-2 border border-line bg-surface px-3 focus-within:border-fg"
          >
            <label htmlFor="console-input" className="font-mono text-accent" aria-hidden>$</label>
            <input
              id="console-input"
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={60}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              aria-label="Console command"
              placeholder="type a command, or tap one above"
              className="h-11 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted focus-visible:outline-none"
            />
          </form>
        </div>
      </div>
    </div>,
    root,
  );
}
