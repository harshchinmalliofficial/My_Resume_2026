// Single place to edit identity, links, and optional assets.
export const site = {
  name: "Harsh Chinmalli",
  headline: "Software Engineer - LLM Systems, RAG & Agentic Workflows",
  location: "Bengaluru, India",
  email: "harshanilchinmalli@gmail.com",
  phone: "+91-8123123872",
  linkedin: "https://www.linkedin.com/in/harsh-chinmalli-1242b42b6/",
  github: "https://github.com/harshchinmalliofficial",
  // Set NEXT_PUBLIC_SITE_URL in Vercel once the domain is known.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Drop your PDF at public/resume.pdf; the CTA links to it automatically.
  resumeFile: "/resume.pdf",
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
