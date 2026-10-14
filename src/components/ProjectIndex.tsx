"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { filters, projects, type Project } from "@/data/projects";
import { strings } from "@/content/personality";
import { emit } from "@/lib/personality/bus";
import { firstThisSession } from "@/lib/personality/messages";
import { FlowDiagram } from "./FlowDiagram";
import { Metrics } from "./Metrics";
import { ProjectViz } from "./ProjectViz";

// A quiet, always-visible one-liner (no hover needed). First engagement per project gives the robot a small nudge.
const quipClass = "mt-2 text-sm text-accent";
const nudge = (slug: string) => firstThisSession(`project-${slug}`) && emit({ type: "robot", pose: "curious" });

const more = "mt-5 inline-flex items-center gap-1 font-medium text-accent underline-offset-4 hover:underline";

function Row({ p, wide }: { p: Project; wide: boolean }) {
  return (
    <article onPointerEnter={() => nudge(p.slug)} onFocus={() => nudge(p.slug)} className={`min-w-0 border-t border-line pt-6 ${wide ? "lg:col-span-7" : "lg:col-span-5"}`}>
      <p className="label">{p.context}</p>
      <div className="mt-6"><ProjectViz slug={p.slug} /></div>
      <h3 className="display mt-8 text-3xl md:text-4xl">
        <Link href={`/projects/${p.slug}`} className="hover:text-accent">{p.title}</Link>
      </h3>
      <p className="mt-1 text-muted">{p.subtitle}</p>
      <p className={quipClass}>{p.quip}</p>
      <p className="mt-4 max-w-[60ch] leading-relaxed">{p.summary}</p>
      <p className="label mt-5">{p.stack.join(", ")}</p>
      <Link href={`/projects/${p.slug}`} className={more}>Read case study <ArrowUpRight size={16} /></Link>
    </article>
  );
}

export function ProjectIndex() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const shown = projects.filter((p) => filter === "All" || p.tags.includes(filter));
  const lead = filter === "All" ? projects[0] : null;
  const rest = lead ? shown.slice(1) : shown;

  return (
    <div>
      <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-3">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`py-1 text-sm transition-colors ${filter === f ? "border-b border-accent text-fg" : "text-muted hover:text-fg"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {lead && (
        <article id="lead-case" onPointerEnter={() => nudge(lead.slug)} onFocus={() => nudge(lead.slug)} className="mt-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="label">Lead case study. {lead.context}</p>
              <h3 className="display mt-4 text-5xl md:text-7xl">
                <Link href={`/projects/${lead.slug}`} className="hover:text-accent">{lead.title}</Link>
              </h3>
              <p className="mt-3 text-xl text-muted">{lead.subtitle}</p>
              <p className={`${quipClass} !mt-4`}>{lead.quip}</p>
            </div>
            <div className="lg:pt-8">
              <p className="max-w-[56ch] text-lg leading-relaxed">{lead.summary}</p>
              <p className="label mt-5">{lead.stack.join(", ")}</p>
              <Link href={`/projects/${lead.slug}`} className={more}>Read case study <ArrowUpRight size={16} /></Link>
            </div>
          </div>
          {lead.metrics && <div id="lead-metrics" className="mt-14"><Metrics metrics={lead.metrics} source={lead.metricsSource} /></div>}
          <div id="lead-flow" className="mt-14"><FlowDiagram nodes={lead.flow.nodes} caption={lead.flow.caption} /></div>
        </article>
      )}

      {shown.length === 0 ? (
        <p role="status" className="mt-10 text-muted">{strings.emptyFilter}</p>
      ) : (
        <div className={`grid gap-x-12 gap-y-16 lg:grid-cols-12 ${lead ? "mt-24" : "mt-12"}`}>
          {rest.map((p, i) => <Row key={p.slug} p={p} wide={i % 4 === 0 || i % 4 === 3} />)}
        </div>
      )}
    </div>
  );
}
