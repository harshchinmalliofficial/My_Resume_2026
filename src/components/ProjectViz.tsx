// Small architecture illustrations for the secondary projects. Conceptual, not measured.
const box = "fill-surface stroke-line";
const line = "stroke-line";
const arrow = "stroke-muted";

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="max-w-full overflow-x-auto" role="group" aria-label={label} tabIndex={0}>
      <svg viewBox="0 0 400 150" className="h-auto w-full min-w-[340px] max-w-[460px]" role="img" aria-label={label}>
        <defs>
          <marker id="a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" className="fill-muted" />
          </marker>
        </defs>
        {children}
      </svg>
    </div>
  );
}
const T = ({ x, y, children, mono, strong, accent, anchor }: { x: number; y: number; children: React.ReactNode; mono?: boolean; strong?: boolean; accent?: boolean; anchor?: "middle" }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize={mono ? 11 : 12.5} fontWeight={strong ? 500 : 400} className={`${accent ? "fill-accent" : strong ? "fill-fg" : "fill-muted"} ${mono ? "font-mono" : ""}`}>{children}</text>
);
const Arrow = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} className={arrow} strokeWidth="1.2" markerEnd="url(#a)" />
);

// Only the chunks nearest the query reach the model.
function Pdf() {
  const pts: [number, number][] = [[140, 24], [158, 96], [176, 40], [150, 118], [232, 28], [246, 62], [238, 112], [196, 120], [136, 62], [252, 94], [216, 22], [172, 70]];
  const hit: [number, number][] = [[196, 56], [214, 80], [190, 84]];
  return (
    <Frame label="Retrieval illustration: a document is split into chunks, embedded, and only the chunks nearest the question are passed to the model">
      <rect x="1" y="8" width="66" height="112" className={box} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="10" y={18 + i * 17} width="48" height="11" className={`fill-none ${[1, 2, 4].includes(i) ? "stroke-accent" : line}`} />
      ))}
      <T x={1} y={140} mono>Chunks</T>
      <Arrow x1={72} y1={64} x2={118} y2={64} />
      <rect x="124" y="8" width="144" height="112" className={`fill-none ${line}`} />
      {pts.map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" className="fill-muted" />)}
      {hit.map(([x, y]) => <circle key={`h${x}${y}`} cx={x} cy={y} r="3.4" className="fill-accent" />)}
      <circle cx="200" cy="72" r="34" className="fill-none stroke-accent" strokeDasharray="3 4" />
      <path d="M200 66 v12 M194 72 h12" className="stroke-fg" strokeWidth="1.5" />
      <T x={124} y={140} mono>Vector index, depth k</T>
      <Arrow x1={274} y1={64} x2={308} y2={64} />
      <rect x="312" y="34" width="87" height="60" className={box} />
      <T x={355} y={60} anchor="middle" strong>Grounded</T>
      <T x={355} y={78} anchor="middle" strong>answer</T>
      <T x={312} y={140} mono>Context only</T>
    </Frame>
  );
}

// Guardrails and grounding wrap everything between retrieval and the answer.
function Xeva() {
  return (
    <Frame label="Workflow illustration: a question is answered from retrieved platform knowledge, inside a guardrail boundary that also contains the translation, content, and onboarding workflows">
      <rect x="1" y="45" width="62" height="60" className={box} />
      <T x={32} y={80} anchor="middle" strong>Question</T>
      <Arrow x1={67} y1={75} x2={80} y2={75} />
      <rect x="84" y="45" width="68" height="60" className={box} />
      <T x={118} y={71} anchor="middle" strong>Azure AI</T>
      <T x={118} y={88} anchor="middle" strong>Search</T>
      <Arrow x1={156} y1={75} x2={176} y2={75} />
      <rect x="170" y="10" width="229" height="128" className="fill-none stroke-accent" strokeDasharray="4 4" />
      <rect x="180" y="45" width="58" height="60" className={box} />
      <T x={209} y={80} anchor="middle" strong>Context</T>
      <Arrow x1={242} y1={75} x2={252} y2={75} />
      <rect x="256" y="32" width="70" height="86" className={box} />
      <T x={291} y={56} anchor="middle" mono>Translate</T>
      <T x={291} y={78} anchor="middle" mono>Generate</T>
      <T x={291} y={100} anchor="middle" mono>Onboard</T>
      <Arrow x1={330} y1={75} x2={340} y2={75} />
      <rect x="342" y="45" width="50" height="60" className={box} />
      <T x={367} y={80} anchor="middle" strong>Answer</T>
      <T x={180} y={130} mono accent>Guardrail boundary</T>
    </Frame>
  );
}

// One generator, three artifacts, one harness that checks them.
function Codeclub() {
  const rows: [number, string][] = [[14, "Question"], [62, "Test cases"], [110, "Rubric"]];
  return (
    <Frame label="Assessment illustration: one generator produces a question, test cases, and a rubric, and an evaluation harness checks quality, consistency, and difficulty before learner feedback">
      <rect x="1" y="55" width="66" height="40" className={box} />
      <T x={34} y={80} anchor="middle" strong>Generate</T>
      {rows.map(([y, t]) => (
        <g key={t}>
          <line x1="68" y1="75" x2="104" y2={y + 13} className={line} strokeWidth="1.2" />
          <rect x="106" y={y} width="92" height="26" className={box} />
          <T x={152} y={y + 17} anchor="middle" strong>{t}</T>
          <line x1="198" y1={y + 13} x2="232" y2="75" className={line} strokeWidth="1.2" />
        </g>
      ))}
      <rect x="234" y="24" width="84" height="102" className="fill-surface stroke-accent" />
      <T x={276} y={46} anchor="middle" strong accent>Harness</T>
      <T x={276} y={72} anchor="middle" mono>quality</T>
      <T x={276} y={90} anchor="middle" mono>consistency</T>
      <T x={276} y={108} anchor="middle" mono>difficulty</T>
      <Arrow x1={322} y1={75} x2={338} y2={75} />
      <rect x="340" y="50" width="59" height="50" className={box} />
      <T x={369} y={72} anchor="middle" strong>Learner</T>
      <T x={369} y={88} anchor="middle" strong>feedback</T>
    </Frame>
  );
}

// Many provider formats converge on one health model, then fan out.
function Cloud() {
  const src: [number, string][] = [[12, "AWS"], [61, "Azure"], [110, "GCP"]];
  return (
    <Frame label="Data-flow illustration: AWS, Azure, and GCP status feeds pass through provider adapters into one shared health model, which is stored in PostgreSQL and streamed to the wallboard over server-sent events">
      {src.map(([y, t]) => (
        <g key={t}>
          <rect x="1" y={y} width="62" height="28" className={box} />
          <T x={32} y={y + 18} anchor="middle" strong>{t}</T>
          <line x1="64" y1={y + 14} x2="98" y2="75" className={line} strokeWidth="1.2" />
        </g>
      ))}
      <rect x="100" y="40" width="78" height="70" className={box} />
      <T x={139} y={70} anchor="middle" strong>Adapters</T>
      <T x={139} y={88} anchor="middle" mono>one per source</T>
      <Arrow x1={182} y1={75} x2={198} y2={75} />
      <rect x="200" y="40" width="78" height="70" className="fill-surface stroke-accent" />
      <T x={239} y={70} anchor="middle" strong accent>Shared</T>
      <T x={239} y={88} anchor="middle" strong accent>health model</T>
      <line x1="280" y1="75" x2="306" y2="36" className={line} strokeWidth="1.2" />
      <line x1="280" y1="75" x2="306" y2="114" className={line} strokeWidth="1.2" />
      <rect x="308" y="14" width="91" height="44" className={box} />
      <T x={353} y={33} anchor="middle" strong>PostgreSQL</T>
      <T x={353} y={49} anchor="middle" mono>incident history</T>
      <rect x="308" y="92" width="91" height="44" className={box} />
      <T x={353} y={111} anchor="middle" strong>SSE stream</T>
      <T x={353} y={127} anchor="middle" mono>live wallboard</T>
    </Frame>
  );
}

const viz: Record<string, () => React.ReactElement> = {
  "pdf-intelligence-engine": Pdf,
  "xeva-ai": Xeva,
  codeclub: Codeclub,
  "cloud-health-dashboard": Cloud,
};

export function ProjectViz({ slug }: { slug: string }) {
  const V = viz[slug];
  return V ? <V /> : null;
}
