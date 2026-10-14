// Engineering journey. Dates appear only where the resume or site data states them; stages without a date have none.
export type Stage = { n: string; title: string; body: string; evidence: { label: string; href?: string }[]; when?: string };

export const journey: Stage[] = [
  {
    n: "01",
    title: "Web and backend foundations",
    body: "Building and shipping the application layer first: Node.js and Express services, REST APIs, and SQL and NoSQL databases.",
    when: "BCA, 2022 to 2025",
    evidence: [{ label: "KLE Technological University" }, { label: "Node.js, Express.js, PostgreSQL, MongoDB" }],
  },
  {
    n: "02",
    title: "Production APIs and delivery",
    body: "Full-stack and platform work at a startup: CI/CD pipelines, logging, database optimisation, and compliance-minded engineering.",
    when: "Jan to Sep 2025",
    evidence: [{ label: "Sikoter / XcelUP LLC", href: "/#experience" }],
  },
  {
    n: "03",
    title: "RAG, embeddings, and search",
    body: "Grounding models in real documents: ingestion, chunking, embeddings, and retrieval, tuned alongside prompts so answers stay tied to the source.",
    evidence: [
      { label: "XEVA AI", href: "/projects/xeva-ai" },
      { label: "PDF Intelligence Engine", href: "/projects/pdf-intelligence-engine" },
    ],
  },
  {
    n: "04",
    title: "MCP, tool orchestration, and agents",
    body: "Treating tool selection as a retrieval problem and putting a policy layer between agents and the tools they can call.",
    evidence: [
      { label: "MCP Gateway", href: "/projects/mcp-gateway" },
      { label: "CodeClub", href: "/projects/codeclub" },
    ],
  },
  {
    n: "05",
    title: "Automation, observability, and cloud operations",
    body: "Agentic workflows for IT support and incident management, plus a cloud health dashboard for operations teams.",
    when: "Sep 2025 to present",
    evidence: [
      { label: "Cognizant Technology Solutions", href: "/#experience" },
      { label: "Global Cloud Health Dashboard", href: "/projects/cloud-health-dashboard" },
    ],
  },
];
