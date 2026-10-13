import type { Metric } from "@/data/projects";

export function Metrics({ metrics, source }: { metrics: Metric[]; source?: string }) {
  return (
    <div>
      <dl className="grid gap-x-10 gap-y-10 md:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="border-t border-accent pt-5">
            <dd className="display text-6xl text-accent md:text-7xl">{m.value}</dd>
            <dt className="mt-4 font-medium">{m.label}</dt>
            <dd className="mt-2 max-w-[34ch] text-sm leading-relaxed text-muted">{m.context}</dd>
          </div>
        ))}
      </dl>
      {source && <p className="label mt-8 max-w-[80ch]">{source}</p>}
    </div>
  );
}
