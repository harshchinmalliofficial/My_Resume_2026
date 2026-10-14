import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getProject, projects } from "@/data/projects";
import { FlowDiagram } from "@/components/FlowDiagram";
import { Metrics } from "@/components/Metrics";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.title, description: p.summary, alternates: { canonical: `/projects/${p.slug}` }, openGraph: { title: p.title, description: p.summary, url: `/projects/${p.slug}` } } : {};
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-14">
      <h2 className="text-2xl font-medium">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

const statusLabel = { implemented: "Implemented", prototype: "Prototype", planned: "Planned" } as const;

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const next = projects[(projects.indexOf(p) + 1) % projects.length];

  return (
    <article className="lane mx-auto max-w-[1280px] px-5 pb-20 pt-10 md:px-8">
      <Link href="/#work" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft size={16} /> All work
      </Link>
      <header className="mt-10 max-w-[900px]">
        <p className="label">{p.context}</p>
        <h1 className="display mt-3 text-5xl md:text-7xl">{p.title}</h1>
        <p className="mt-3 text-xl text-muted">{p.subtitle}</p>
        <p className="mt-8 max-w-[60ch] text-lg leading-relaxed">{p.summary}</p>
        <p className="label mt-6">{p.stack.join(", ")}</p>
      </header>

      <div className="mt-14">
        <Block title="The problem"><p className="max-w-[65ch] text-lg leading-relaxed">{p.problem}</p></Block>
        <Block title="What I built">
          <ul className="max-w-[68ch] space-y-3">
            {p.contribution.map((c) => <li key={c} className="border-l border-line pl-5 leading-relaxed">{c}</li>)}
          </ul>
        </Block>
        <Block title="Architecture"><FlowDiagram nodes={p.flow.nodes} caption={p.flow.caption} /></Block>
        <Block title="Key decisions">
          <dl className="grid gap-x-10 gap-y-8 md:grid-cols-2">
            {p.decisions.map((d) => (
              <div key={d.title}>
                <dt className="font-medium text-accent">{d.title}</dt>
                <dd className="mt-2 leading-relaxed text-muted">{d.body}</dd>
              </div>
            ))}
          </dl>
        </Block>
        <Block title="Trade-offs and reliability">
          <ul className="max-w-[68ch] space-y-3">
            {p.tradeoffs.map((t) => <li key={t} className="border-l border-line pl-5 leading-relaxed">{t}</li>)}
          </ul>
        </Block>
        {p.integrations && (
          <Block title="Integrations">
            <ul className="grid gap-3 sm:grid-cols-2">
              {p.integrations.map((i) => (
                <li key={i.name} className="flex justify-between border-b border-line pb-2"><span>{i.name}</span><span className="label">{statusLabel[i.status]}</span></li>
              ))}
            </ul>
          </Block>
        )}
        <Block title="Results">
          {p.metrics ? <Metrics metrics={p.metrics} source={p.metricsSource} /> : <p className="text-muted">{p.noMetricsNote}</p>}
        </Block>
        {p.links.length > 0 && (
          <Block title="Links">
            <ul className="flex flex-wrap gap-3">
              {p.links.map((l) => (
                <li key={l.href}><a href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 border border-line px-4 py-2 hover:border-fg">{l.label} <ArrowUpRight size={16} /></a></li>
              ))}
            </ul>
          </Block>
        )}
        {p.confidentialityNote && <p className="label border-t border-line pt-6">{p.confidentialityNote}</p>}
      </div>

      <Link href={`/projects/${next.slug}`} className="group mt-16 flex items-center justify-between border-t border-line pt-8">
        <span>
          <span className="label block">Next case study</span>
          <span className="display mt-2 block text-3xl group-hover:text-accent md:text-4xl">{next.title}</span>
        </span>
        <ArrowRight size={28} className="shrink-0 transition-transform group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
