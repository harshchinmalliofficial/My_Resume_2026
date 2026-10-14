export type Role = {
  company: string;
  title: string;
  place: string;
  period: string;
  points: string[];
};

export const experience: Role[] = [
  {
    company: "Cognizant Technology Solutions",
    title: "AI Augmented Infra Ops Developer",
    place: "Bengaluru, India",
    period: "September 2025 - Present",
    points: [
      "Designed and shipped agentic workflows for L1.5-L2 IT support tickets, combining context retrieval, tool usage, and multi-step decisions.",
      "Developed a Global Cloud Health Dashboard for cloud service monitoring and actionable operational insights.",
      "Built a Major Incident Management bridge workflow that detects P1 incidents, initiates meeting bridges, notifies stakeholders, and records RCA context.",
      "Engineered a self-service onboarding workflow using context-aware NLP, PostgreSQL state management, and automated server registration.",
      "Applied prompt and context engineering to improve reliability, reduce hallucinations, and enforce business guardrails.",
    ],
  },
  {
    company: "Sikoter / XcelUP LLC",
    title: "Head of AI, Product & Learning",
    place: "Remote, Chicago, Illinois",
    period: "January 2025 - September 2025",
    points: [
      "Built XEVA AI, a RAG assistant using Azure AI Search and Azure Cognitive Search.",
      "Designed document ingestion, chunking, embedding, retrieval, and response-synthesis pipelines.",
      "Developed LLM workflows for content generation, translation, community moderation, and onboarding.",
      "Implemented observability and centralized logging with Winston.js.",
      "Contributed to SOC 2 and payments-related compliance improvements.",
      "Improved deployment reliability and infrastructure performance through CI/CD and database optimization.",
    ],
  },
];

export const capabilities: { group: string; core?: boolean; items: string[] }[] = [
  {
    group: "LLM systems",
    core: true,
    items: ["LLMs", "RAG", "Agentic AI", "Prompt engineering", "Context engineering", "NLP", "Inference optimization", "Guardrails", "RLHF and feedback loops"],
  },
  {
    group: "AI infrastructure and tooling",
    core: true,
    items: ["MCP", "LangChain", "FAISS", "Azure AI Search", "Azure Cognitive Search", "Gemini API", "Evaluation harnesses", "AI observability"],
  },
  { group: "Languages", items: ["Python", "TypeScript", "JavaScript", "Java", "Go", "C", "C++"] },
  { group: "Backend and APIs", items: ["Node.js", "Express.js", "REST APIs", "Microservices", "OpenAPI / Swagger"] },
  { group: "Databases and retrieval", items: ["PostgreSQL", "MongoDB", "MySQL", "DynamoDB", "Vector stores"] },
  { group: "Cloud and DevOps", items: ["GCP", "AWS", "Azure", "Docker", "Kubernetes", "Linux", "GitHub Actions", "CI/CD"] },
  { group: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "HTML", "CSS"] },
];

export type Cert = {
  id: string;
  name: string;
  issuer: string;
  status: "completed" | "in-progress";
  // Put the original badge at public/badges/<file>, then set `badge`.
  badge?: string;
  verifyUrl?: string;
};

export const certifications: Cert[] = [
  { id: "ctx", name: "Context Engineering Foundation", issuer: "Cognizant", status: "completed" },
  { id: "mcp", name: "Introduction to Model Context Protocol", issuer: "Anthropic", status: "completed" },
  { id: "sub", name: "Introduction to Subagents", issuer: "Anthropic", status: "completed" },
  { id: "api", name: "Claude with the Anthropic API", issuer: "Anthropic", status: "completed" },
  { id: "c101", name: "Claude 101", issuer: "Anthropic", status: "completed" },
  { id: "cc101", name: "Claude Code 101", issuer: "Anthropic", status: "completed" },
  { id: "gem", name: "Build with Gemini", issuer: "Google Cloud", status: "completed" },
  { id: "cca", name: "Claude Certified Architect: Foundations", issuer: "Anthropic", status: "in-progress" },
];

// Files live in public/certificates (PDF + preview) and public/badges.
export type Credential = {
  id: string;
  name: string;
  issuer: string;
  kind: "certificate" | "badge";
  image: string;
  pdf?: string;
  addedOn?: string; // ISO date this was published here; "Recently added" shows for 60 days. Omit when unknown.
};
export const credentials: Credential[] = [
  { id: "api", name: "Claude with the Anthropic API", issuer: "Anthropic", kind: "certificate", image: "/certificates/claude-with-the-anthropic-api.webp", pdf: "/certificates/claude-with-the-anthropic-api.pdf" },
  { id: "mcp", name: "Introduction to Model Context Protocol", issuer: "Anthropic", kind: "certificate", image: "/certificates/introduction-to-model-context-protocol.webp", pdf: "/certificates/introduction-to-model-context-protocol.pdf" },
  { id: "sub", name: "Introduction to subagents", issuer: "Anthropic", kind: "certificate", image: "/certificates/introduction-to-subagents.webp", pdf: "/certificates/introduction-to-subagents.pdf" },
  { id: "cc101", name: "Claude Code 101", issuer: "Anthropic", kind: "certificate", image: "/certificates/claude-code-101.webp", pdf: "/certificates/claude-code-101.pdf" },
  { id: "c101", name: "Claude 101", issuer: "Anthropic", kind: "certificate", image: "/certificates/claude-101.webp", pdf: "/certificates/claude-101.pdf" },
  { id: "ctx", name: "Context Engineering Foundation", issuer: "Cognizant", kind: "badge", image: "/badges/context-engineering-foundation.png" },
];

export const education = { school: "KLE Technological University", degree: "Bachelor of Computer Applications" };
export const spoken = ["English", "Hindi", "Kannada"];
