export type FlowNode = { id: string; label: string; detail: string; tech?: string };
export type Metric = { value: string; label: string; context: string };
export type Integration = { name: string; status: "implemented" | "prototype" | "planned" };

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  tags: string[];
  stack: string[];
  context: string;
  problem: string;
  contribution: string[];
  flow: { caption: string; nodes: FlowNode[] };
  decisions: { title: string; body: string }[];
  tradeoffs: string[];
  metrics?: Metric[];
  metricsSource?: string;
  noMetricsNote?: string;
  integrations?: Integration[];
  links: { label: string; href: string }[]; // add real repo / demo URLs here
  confidentialityNote?: string;
};

export const filters = ["All", "RAG", "Agents", "Security", "Evaluation", "Infra"] as const;

export const projects: Project[] = [
  {
    slug: "mcp-gateway",
    title: "MCP Gateway",
    subtitle: "Secure tool routing and retrieval",
    summary:
      "A protocol-level proxy between AI agents and 150+ real and simulated MCP tools. It retrieves only the relevant tools per request and gates them with a security policy.",
    tags: ["Agents", "Security", "RAG"],
    stack: ["Python", "MCP", "FAISS", "Groq / Gemini APIs", "SQLite"],
    context: "Personal engineering project",
    problem:
      "An agent connected to many MCP servers has to carry every tool description in its prompt. That inflates tokens and latency, makes tool selection harder, and gives a poisoned tool description a direct path into the model.",
    contribution: [
      "Built a protocol-level Python proxy that sits between agents and more than 150 real and simulated tools across MCP servers.",
      "Used retrieval to select relevant tools per request instead of exposing the full catalogue.",
      "Implemented SHA-256 tool-description hashing, prompt-injection scanning, and SQLite audit logging.",
      "Designed the benchmark: 48 labelled test cases, more than 300 live API calls, three configurations, plus a tool-count crossover experiment.",
      "Verified the security policy against a live demonstration.",
    ],
    flow: {
      caption: "Conceptual architecture. Select a stage for detail. This diagram is an illustration, not a measurement.",
      nodes: [
        { id: "agent", label: "Agent", detail: "Sends a task and receives only the tools that are relevant to it.", tech: "Groq / Gemini APIs" },
        { id: "retrieval", label: "Retrieval layer", detail: "Embeds the request and returns the closest tool descriptions from the catalogue instead of all of them.", tech: "FAISS" },
        { id: "policy", label: "Policy gate", detail: "Checks each tool description against its SHA-256 hash and scans it for prompt-injection patterns before it can reach the model.", tech: "SHA-256, injection scan" },
        { id: "tools", label: "MCP tools", detail: "More than 150 real and simulated tools exposed through MCP servers.", tech: "MCP" },
        { id: "audit", label: "Audit trail", detail: "Gateway activity is recorded in SQLite so decisions can be inspected afterwards.", tech: "SQLite" },
      ],
    },
    decisions: [
      { title: "Retrieve tools, do not list them", body: "Tool selection becomes a retrieval problem. The measured effect is a prompt that shrinks from 19,167 tokens to 701 while selection accuracy stays high." },
      { title: "Sit at the protocol level", body: "As a proxy between agent and MCP servers, the gateway can enforce policy without modifying either side." },
      { title: "Fingerprint every description", body: "Hashing tool descriptions with SHA-256 gives the policy layer a stable reference to compare against, so a changed description is detectable." },
      { title: "Measure the crossover", body: "A tool-count experiment was run to find where retrieval starts to pay off, rather than assuming it always does." },
    ],
    tradeoffs: [
      "Retrieval adds a lookup step, so its benefit depends on catalogue size. That is why the crossover experiment exists.",
      "The 150+ tool catalogue mixes real and simulated tools, so results describe that catalogue and should not be read as production traffic.",
      "Prompt-injection scanning reduces risk but is one layer of defence, not a guarantee. The audit log exists so decisions can be reviewed.",
    ],
    metrics: [
      { value: "27x", label: "fewer prompt tokens", context: "Retrieval-selected tools cut the prompt from 19,167 tokens to 701." },
      { value: "26%", label: "lower end-to-end latency", context: "Reported at scale, while tool-selection accuracy was maintained." },
      { value: "97.9%", label: "tool-selection accuracy", context: "Maintained while tokens and latency dropped across the benchmark." },
    ],
    metricsSource: "Benchmark scope: 48 labelled test cases, 300+ live API calls, three configurations. Reported results for this project.",
    links: [
      { label: "GitHub repository", href: "https://github.com/harshchinmalliofficial/MCP-Gateway-Tool-Retrieval-Policy-Layer-for-Multi-Server-Agents" },
      { label: "Medium article", href: "https://medium.com/@harshanilchinmalli/i-built-a-gateway-to-fix-ai-agents-drowning-in-tools-the-results-werent-what-i-expected-3e53b454ff11?sharedUserId=harshanilchinmalli" },
      { label: "LinkedIn post", href: "https://lnkd.in/p/dvKJzST6" },
    ],
  },
  {
    slug: "pdf-intelligence-engine",
    title: "PDF Intelligence Engine",
    subtitle: "Production RAG pipeline",
    summary: "An offline-capable document question-answering system with local vector retrieval and context-grounded answers.",
    tags: ["RAG"],
    stack: ["Python", "LangChain", "FAISS", "Embeddings", "Groq / Gemini APIs"],
    context: "Personal engineering project",
    problem: "Asking a model about a long PDF invites guessed answers. The system needs to find the right passages and answer only from them, without depending on an external retrieval server.",
    contribution: [
      "Built document ingestion, semantic chunking, embedding generation, and vector retrieval.",
      "Generated answers grounded in the retrieved context.",
      "Tuned retrieval depth, chunking strategy, and prompts to improve answer relevance and reduce hallucinations.",
      "Designed for low-latency local execution with no external retrieval server.",
    ],
    flow: {
      caption: "The pipeline stages as built. Select a stage for detail.",
      nodes: [
        { id: "ingest", label: "Ingest", detail: "Reads the PDF and extracts text for processing.", tech: "Python" },
        { id: "chunk", label: "Chunk", detail: "Splits text into semantically coherent passages.", tech: "LangChain" },
        { id: "embed", label: "Embed", detail: "Turns each chunk into a vector.", tech: "Embeddings" },
        { id: "retrieve", label: "Retrieve", detail: "Finds the nearest chunks to the question in a local index.", tech: "FAISS" },
        { id: "assemble", label: "Assemble context", detail: "Builds the prompt from the retrieved passages.", tech: "Prompting" },
        { id: "answer", label: "Grounded answer", detail: "Generates a response constrained to the supplied context.", tech: "Groq / Gemini APIs" },
      ],
    },
    decisions: [
      { title: "Local index", body: "FAISS runs in-process, so the pipeline needs no retrieval server and keeps latency low." },
      { title: "Tune retrieval, not just prompts", body: "Retrieval depth and chunking were adjusted alongside prompts, because the model can only be as grounded as the context it receives." },
    ],
    tradeoffs: [
      "Chunk size trades precision against context. Smaller chunks retrieve sharply but can lose surrounding meaning.",
      "Deeper retrieval raises recall but adds tokens and noise to the prompt.",
    ],
    noMetricsNote: "No accuracy or evaluation scores are published for this project, so none are shown.",
    links: [
      { label: "GitHub repository", href: "https://github.com/harshchinmalliofficial/PDF-CHATBOT" },
    ],
  },
  {
    slug: "xeva-ai",
    title: "XEVA AI",
    subtitle: "Agentic LLM platform assistant",
    summary: "A production RAG assistant grounded in platform knowledge, with multi-step agentic workflows for content, translation, and onboarding.",
    tags: ["RAG", "Agents"],
    stack: ["Azure AI Search", "Azure Cognitive Search", "LLM orchestration", "NLP"],
    context: "Built at Sikoter / XcelUP LLC",
    problem: "Users of the platform needed accurate, context-aware answers and guided workflows, and the assistant had to stay inside compliance boundaries.",
    contribution: [
      "Built a production RAG assistant grounded in platform-specific knowledge.",
      "Designed retrieval pipelines that supply relevant context to each question.",
      "Developed multi-step agentic workflows for content generation, translation, onboarding, and context-aware guidance.",
      "Applied prompt engineering, context engineering, and compliance guardrails to improve output reliability.",
    ],
    flow: {
      caption: "Generalised workflow. Internal details are intentionally omitted.",
      nodes: [
        { id: "q", label: "User question", detail: "A question or task from inside the platform.", tech: "NLP" },
        { id: "ret", label: "Retrieval", detail: "Platform knowledge is searched for the most relevant context.", tech: "Azure AI Search" },
        { id: "guard", label: "Context and guardrails", detail: "Retrieved context is assembled and compliance rules are applied before generation.", tech: "Context engineering" },
        { id: "orch", label: "Orchestration", detail: "Multi-step workflows handle tasks such as translation, content generation, and onboarding.", tech: "LLM orchestration" },
        { id: "ans", label: "Grounded answer", detail: "The response is composed from retrieved context.", tech: "Response synthesis" },
      ],
    },
    decisions: [
      { title: "Ground first", body: "Answers come from retrieved platform knowledge rather than model memory." },
      { title: "Separate retrieval from orchestration", body: "Retrieval supplies context. Workflows decide what to do with it, which keeps each part testable." },
    ],
    tradeoffs: ["Guardrails constrain what the assistant can say, trading some flexibility for reliability and compliance."],
    noMetricsNote: "No usage or accuracy figures are published for this project, so none are shown.",
    links: [],
    confidentialityNote: "Proprietary customer data and internal implementation details are not described on this site.",
  },
  {
    slug: "codeclub",
    title: "CodeClub",
    subtitle: "LLM-powered assessment engine",
    summary: "Generates coding questions, test cases, and rubrics for instructors, with an evaluation harness that checks question quality.",
    tags: ["Evaluation", "Agents"],
    stack: ["Gemini API", "NLP", "Evaluation harnesses"],
    context: "Personal engineering project",
    problem: "Generated questions vary in quality and difficulty. Instructors need material they can trust, and learners need feedback.",
    contribution: [
      "Generated coding questions, test cases, and evaluation rubrics for instructors.",
      "Developed an evaluation harness to assess question quality and improve consistency and difficulty calibration.",
      "Built a platform with leaderboards and performance tracking for AI-assisted learning.",
    ],
    flow: {
      caption: "Assessment workflow. Select a stage for detail.",
      nodes: [
        { id: "gen", label: "Generate", detail: "Drafts a question, test cases, and a rubric.", tech: "Gemini API" },
        { id: "val", label: "Validate", detail: "The evaluation harness checks quality, consistency, and difficulty calibration.", tech: "Evaluation harness" },
        { id: "rub", label: "Rubric evaluation", detail: "Submissions are assessed against the rubric and test cases.", tech: "Rubrics" },
        { id: "fb", label: "Feedback", detail: "Results feed leaderboards and performance tracking.", tech: "Leaderboards" },
      ],
    },
    decisions: [
      { title: "Evaluate the generator", body: "A harness checks generated questions before they reach students, so quality is measured instead of assumed." },
    ],
    tradeoffs: ["Automated calibration of difficulty is an approximation and benefits from instructor review."],
    noMetricsNote: "No evaluation scores are published for this project, so none are shown.",
    links: [
      { label: "GitHub repository", href: "https://github.com/harshchinmalliofficial/CodeClub" },
    ],
  },
  {
    slug: "cloud-health-dashboard",
    title: "Global Cloud Health Dashboard",
    subtitle: "Operational wallboard for cloud status",
    summary: "A real-time wallboard that normalises cloud-provider status feeds into one view with incident history.",
    tags: ["Infra"],
    stack: ["Node.js", "TypeScript", "Express", "PostgreSQL", "SSE"],
    context: "Built at Cognizant Technology Solutions",
    problem: "Each cloud provider publishes status differently. Operations teams need one consistent, live view of health.",
    contribution: [
      "Developed a cloud-provider health monitoring wallboard for operational awareness.",
      "Designed provider adapters, health-state normalisation, incident history, and real-time updates.",
      "Worked with AWS, Azure, GCP, and selected AI and productivity service status sources.",
    ],
    flow: {
      caption: "Data flow from provider feeds to the wallboard.",
      nodes: [
        { id: "feeds", label: "Status feeds", detail: "Public status sources from cloud providers and services.", tech: "AWS, Azure, GCP" },
        { id: "adapt", label: "Provider adapters", detail: "One adapter per source translates its format.", tech: "TypeScript" },
        { id: "norm", label: "Normalisation", detail: "Provider-specific states map to one shared health model.", tech: "Node.js" },
        { id: "store", label: "Incident history", detail: "Health changes and incidents are stored.", tech: "PostgreSQL" },
        { id: "sse", label: "Live wallboard", detail: "Updates stream to the dashboard as they happen.", tech: "Express, SSE" },
      ],
    },
    decisions: [
      { title: "Adapters behind one model", body: "Normalising early keeps the dashboard independent of any single provider's format." },
      { title: "Server-sent events", body: "One-way streaming fits a wallboard that only needs to receive updates." },
    ],
    tradeoffs: ["Depending on public status feeds means the dashboard is only as timely as the feeds themselves."],
    noMetricsNote: "No uptime or usage figures are published for this project, so none are shown.",
    // integrations: [{ name: "AWS", status: "implemented" }] // fill in to show per-source status
    links: [
      { label: "Live dashboard", href: "https://global-outrage-dashboard.onrender.com/" },
      { label: "GitHub repository", href: "https://github.com/harshchinmalliofficial/Global-Outrage-Dashboard" },
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
