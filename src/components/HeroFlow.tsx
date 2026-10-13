import Link from "next/link";

type Stage = {
  label: string;
  tech: string;
  support?: { title: string; lines: [string, string]; project: string; slug: string };
};

// Top row is the request path; each support box is the subsystem I built for that stage.
const stages: Stage[] = [
  { label: "User query", tech: "Natural language" },
  { label: "Context retrieval", tech: "FAISS, Azure AI Search", support: { title: "Vector index", lines: ["FAISS or Azure AI", "Search, chunked docs"], project: "PDF Intelligence Engine", slug: "pdf-intelligence-engine" } },
  { label: "Tool orchestration", tech: "MCP, multi-step flows", support: { title: "Policy gate", lines: ["SHA-256, injection", "scan, audit log"], project: "MCP Gateway", slug: "mcp-gateway" } },
  { label: "Model reasoning", tech: "Context engineering", support: { title: "Guardrails", lines: ["Compliance and", "grounding rules"], project: "XEVA AI", slug: "xeva-ai" } },
  { label: "Verified response", tech: "Guardrails, evals", support: { title: "Evaluation harness", lines: ["Quality and difficulty", "checks"], project: "CodeClub", slug: "codeclub" } },
];

const W = 210;
const STEP = 247.5;
const v = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function HeroFlow() {
  return (
    <figure aria-label="How a request moves through the systems I build">
      {/* Desktop: custom SVG system diagram */}
      <svg viewBox="0 0 1200 262" className="hidden h-auto w-full lg:block" role="group" aria-label="System flow from user query to verified response, with the subsystem behind each stage">
        <defs>
          <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" className="fill-muted" />
          </marker>
        </defs>
        {stages.map((s, i) => {
          const x = i * STEP;
          return (
            <g key={s.label}>
              <rect x={x + 0.5} y={0.5} width={W - 1} height={96} className="beat-s fill-surface stroke-line" style={v(i)} />
              <text x={x + 16} y={26} className="fill-muted font-mono" fontSize="12">{i + 1}</text>
              <text x={x + 16} y={55} className="fill-fg" fontSize="19" fontWeight="500">{s.label}</text>
              <text x={x + 16} y={79} className="fill-muted font-mono" fontSize="11.5">{s.tech}</text>
              {i < stages.length - 1 && <line x1={x + W + 4} y1={48} x2={x + STEP - 3} y2={48} className="stroke-muted" strokeWidth="1.25" markerEnd="url(#arr)" />}
              {s.support && (
                <>
                  <line x1={x + W / 2} y1={98} x2={x + W / 2} y2={146} className="stroke-line" strokeWidth="1.25" strokeDasharray="3 4" markerEnd="url(#arr)" />
                  <rect x={x + 0.5} y={150.5} width={W - 1} height={110} className="fill-none stroke-line" />
                  <text x={x + 16} y={178} className="fill-fg" fontSize="16" fontWeight="500">{s.support.title}</text>
                  <text x={x + 16} y={199} className="fill-muted font-mono" fontSize="11.5">{s.support.lines[0]}</text>
                  <text x={x + 16} y={215} className="fill-muted font-mono" fontSize="11.5">{s.support.lines[1]}</text>
                  <Link href={`/projects/${s.support.slug}`} className="group">
                    <text x={x + 16} y={244} className="fill-accent font-mono group-hover:underline" fontSize="11.5">{s.support.project} →</text>
                  </Link>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Below lg: the same diagram as stacked boxes, each stage carrying its subsystem */}
      <ol className="lg:hidden">
        {stages.map((s, i) => (
          <li key={s.label} className="relative pb-5 last:pb-0">
            {i < stages.length - 1 && <span aria-hidden className="absolute bottom-0 left-5 h-5 w-px bg-line" />}
            <div className="beat-box border border-line bg-surface p-4" style={v(i)}>
              <p className="label">{i + 1}</p>
              <p className="mt-1 font-medium leading-tight">{s.label}</p>
              <p className="label mt-1">{s.tech}</p>
              {s.support && (
                <div className="mt-4 border-l border-accent pl-3">
                  <p className="text-sm font-medium">{s.support.title}</p>
                  <p className="label mt-1">{s.support.lines.join(" ")}</p>
                  <Link href={`/projects/${s.support.slug}`} className="label mt-2 inline-block !text-accent underline underline-offset-4">{s.support.project}</Link>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="label mt-4">Conceptual: where each project sits in the request path.</figcaption>
    </figure>
  );
}
