// Guided tour content. Every claim is derived from the typed portfolio data, and every link is a real URL.
import { certifications, experience } from "@/data/profile";
import { getProject, projects } from "@/data/projects";

export type TourLink = { label: string; href?: string; action?: "resume" };
export type TourStep = { id: string; title: string; body: string; target?: string; links?: TourLink[] };

const mcp = getProject("mcp-gateway")!;
const repo = (slug: string) => getProject(slug)?.links.find((l) => /github/i.test(l.href));
const completed = certifications.filter((c) => c.status === "completed").length;

const finish: TourStep = {
  id: "finish",
  title: "That's the tour",
  body: "The resume has the full background, and the contact section has the fastest way to reach Harsh.",
  target: "contact",
  links: [{ label: "View resume", action: "resume" }, { label: "Contact", href: "/#contact" }],
};

export const tours: Record<"quick" | "deep", { name: string; steps: TourStep[] }> = {
  quick: {
    name: "Quick tour",
    steps: [
      { id: "intro", title: "Start here", body: "Harsh builds LLM systems, retrieval pipelines, and agentic workflows. The hero is the one-paragraph version.", target: "intro" },
      {
        id: "work",
        title: "Selected work",
        body: `${projects.length} projects, led by ${projects[0].title}. Each has a case study with the problem, the decisions, and the tradeoffs.`,
        target: "work",
        links: [{ label: `${mcp.title} case study`, href: `/projects/${mcp.slug}` }],
      },
      { id: "experience", title: "Experience", body: experience.map((r) => `${r.company} (${r.period})`).join(". ") + ".", target: "experience" },
      { id: "creds", title: "Certificates and badges", body: `${completed} completed certifications are listed. Certificates with a PDF link to the original file.`, target: "credentials" },
      finish,
    ],
  },
  deep: {
    name: "Deep dive",
    steps: [
      { id: "pattern", title: "The pattern", body: "Each project sits somewhere in this request path: retrieval, tool use, policy, evaluation. It is a conceptual diagram, not a measurement.", target: "system-flow" },
      { id: "arch", title: `${mcp.title} architecture`, body: mcp.flow.nodes.map((n) => n.label).join(", ") + ". Select a stage in the diagram for its detail.", target: "lead-flow" },
      {
        id: "bench",
        title: "Verified benchmarks",
        body: (mcp.metrics ?? []).map((m) => `${m.value} ${m.label}`).join(", ") + `. ${mcp.metricsSource ?? ""}`,
        target: "lead-metrics",
      },
      {
        id: "decisions",
        title: "Decisions and sources",
        body: "The case study lays out the engineering decisions and the tradeoffs, and the code and write-ups are public.",
        links: [
          { label: "Case study", href: `/projects/${mcp.slug}` },
          ...mcp.links.map((l) => ({ label: l.label, href: l.href })),
        ],
      },
      {
        id: "others",
        title: "More repositories",
        body: "The other projects have their own case studies and public code where it exists.",
        links: projects
          .filter((p) => p.slug !== mcp.slug)
          .flatMap((p) => [{ label: `${p.title} case study`, href: `/projects/${p.slug}` }, ...(repo(p.slug) ? [{ label: `${p.title} on GitHub`, href: repo(p.slug)!.href }] : [])]),
      },
      finish,
    ],
  },
};
