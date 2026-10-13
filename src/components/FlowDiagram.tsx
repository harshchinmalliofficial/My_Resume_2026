"use client";
import { useRef, useState } from "react";
import type { FlowNode } from "@/data/projects";

export function FlowDiagram({ nodes, caption }: { nodes: FlowNode[]; caption: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const node = nodes[active];

  // Arrow keys move between stages; Tab still reaches every stage.
  const onKey = (e: React.KeyboardEvent) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const next = (active + d + nodes.length) % nodes.length;
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <figure>
      <ol
        onKeyDown={onKey}
        className="grid gap-5 md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))] md:gap-4"
        style={{ "--n": nodes.length } as React.CSSProperties}
      >
        {nodes.map((n, i) => (
          <li
            key={n.id}
            className="relative after:absolute after:left-5 after:top-full after:h-5 after:w-px after:bg-line last:after:hidden md:after:left-full md:after:top-1/2 md:after:h-px md:after:w-4"
          >
            <button
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={`block w-full border px-4 py-3 md:h-full text-left transition-colors ${
                i === active ? "border-accent bg-surface" : "border-line hover:border-muted"
              }`}
            >
              <span className={`label ${i === active ? "!text-accent" : ""}`}>{i + 1}</span>
              <span className="mt-1 block text-[0.95rem] font-medium leading-tight">{n.label}</span>
              {n.tech && <span className="label mt-2 block break-words">{n.tech}</span>}
            </button>
            {/* Mobile: detail sits directly under the tapped stage, never after the whole stack. */}
            {i === active && (
              <div role="status" className="fadein border border-t-0 border-accent bg-surface p-4 text-sm leading-relaxed text-muted md:hidden">
                {n.detail}
              </div>
            )}
          </li>
        ))}
      </ol>
      <div key={node.id} role="status" className="fadein mt-5 hidden border border-line bg-surface p-5 md:block">
        <p className="font-medium">{node.label}</p>
        <p className="mt-1 max-w-[65ch] text-muted">{node.detail}</p>
      </div>
      <figcaption className="label mt-3">{caption}</figcaption>
    </figure>
  );
}
