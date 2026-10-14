// Single place to edit identity, links, and optional assets.
export const site = {
  name: "Harsh Chinmalli",
  headline: "Software Engineer - LLM Systems, RAG & Agentic Workflows",
  location: "Bengaluru, India",
  email: "harshanilchinmalli@gmail.com",
  phone: "+91-8123123872",
  linkedin: "https://www.linkedin.com/in/harsh-chinmalli-1242b42b6/",
  github: "https://github.com/harshchinmalliofficial",
  // Canonical URL. NEXT_PUBLIC_SITE_URL can override it (it is a public value, never a secret).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://harshchinmalli2026.vercel.app",
  // Exact on-disk path under public/ (the folder is "Resume", capitalised; Linux hosts are case-sensitive).
  resumeFile: "/Resume/Harsh_Chinmalli_Resume (1).pdf",
  resumeDownloadName: "Harsh_Chinmalli_Resume.pdf",
  description:
    "Software engineer building LLM systems, RAG pipelines, agentic workflows, and MCP infrastructure with a focus on reliability, evaluation, and security.",
} as const;

export const nav = [
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#about", label: "About" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#contact", label: "Contact" },
] as const;
