import Image from "next/image";
import { ArrowUpRight, EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { capabilities, certifications, credentials, education, experience, spoken } from "@/data/profile";
import { site } from "@/data/site";
import { strings } from "@/content/personality";
import { journey } from "@/content/journey";
import { CopyButton } from "./CopyButton";
import { ProjectIndex } from "./ProjectIndex";
import { Reveal } from "./Reveal";

// Heading roles: display (Work, Capabilities), rail (Experience, Certifications), statement (About, Contact).
const wrap = "lane mx-auto max-w-[1280px] px-5 md:px-8";
const display = "display text-5xl md:text-7xl";
const rail = "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-14";

function Section({ id, children, className = "py-20 md:py-28" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className="border-t border-line">
      <div className={`${wrap} ${className}`}>{children}</div>
    </section>
  );
}

export function Work() {
  return (
    <Section id="work">
      <h2 className={display}>Selected work</h2>
      <p className="mt-5 max-w-[60ch] text-lg text-muted">Five systems, presented as case studies. Metrics appear only where they were measured.</p>
      <div className="mt-14"><ProjectIndex /></div>
    </Section>
  );
}

export function Experience() {
  return (
    <Section id="experience">
      <div className={rail}>
        <h2 className="text-2xl font-medium lg:sticky lg:top-24 lg:self-start">Experience</h2>
        <ol className="space-y-16">
          {experience.map((r) => (
            <li key={r.company}>
              <Reveal>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="text-2xl font-medium tracking-tight md:text-3xl">{r.company}</h3>
                  <p className="label">{r.period}</p>
                </div>
                <p className="mt-2 text-accent">{r.title}</p>
                <p className="label mt-1">{r.place}</p>
                <ul className="mt-6 space-y-3 border-l border-line pl-6">
                  {r.points.map((p) => <li key={p} className="max-w-[68ch] leading-relaxed">{p}</li>)}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

export function Journey() {
  return (
    <Section id="journey" className="py-20 md:py-28">
      <div className={rail}>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-2xl font-medium">Engineering journey</h2>
          <p className="label mt-2">A path, not a formal career timeline. Dates appear only where the resume gives them.</p>
        </div>
        <ol className="relative space-y-10 border-l border-line pl-8">
          {journey.map((st) => (
            <li key={st.n} className="relative">
              <span aria-hidden className="absolute -left-[2.45rem] top-1.5 size-2.5 bg-accent" />
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="label">{st.n}</p>
                <h3 className="text-xl font-medium tracking-tight">{st.title}</h3>
                {st.when && <p className="label">{st.when}</p>}
              </div>
              <p className="mt-2 max-w-[62ch] leading-relaxed text-muted">{st.body}</p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                {st.evidence.map((e) => (
                  <li key={e.label}>{e.href ? <a href={e.href} className="text-accent underline underline-offset-4">{e.label}</a> : <span className="text-muted">{e.label}</span>}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

export function About() {
  return (
    <Section id="about" className="py-24 md:py-36 lg:pl-[16%]">
      <Reveal>
        <h2 className="display max-w-[22ch] text-4xl md:text-6xl">I&apos;m interested in what happens after a model gives its first answer.</h2>
        <div className="mt-10 max-w-[62ch] space-y-5 text-lg leading-relaxed text-muted">
          <p>Is the right context in front of it? Does the agent pick the right tool, and can we show that it did? How do we know the system is reliable, and is it safe enough to run in a real environment?</p>
          <p>My work sits where LLM systems, retrieval, agent orchestration, evaluation, and production engineering meet. The MCP Gateway reflects that approach: it comes with a benchmark and a crossover experiment, not just a demo.</p>
        </div>
      </Reveal>
    </Section>
  );
}

export function Capabilities() {
  const core = capabilities.filter((c) => c.core);
  const rest = capabilities.filter((c) => !c.core);
  return (
    <Section id="capabilities">
      <h2 className={display}>Capabilities</h2>
      <p className="mt-5 max-w-[60ch] text-lg text-muted">Grouped by relevance to LLM systems work, most central first.</p>
      <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-16">
        {core.map((c) => (
          <div key={c.group} className="border-t border-accent pt-5">
            <h3 className="text-xl font-medium text-accent">{c.group}</h3>
            <p className="mt-5 text-2xl leading-snug tracking-tight md:text-[1.75rem]">
              {c.items.map((it, i) => (
                <span key={it}>
                  <span className="whitespace-nowrap">
                    {it}
                    {i < c.items.length - 1 && <span aria-hidden className="text-muted"> /</span>}
                  </span>{" "}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-16 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((c) => (
          <div key={c.group} className="border-t border-line pt-4">
            <h3 className="font-medium">{c.group}</h3>
            <p className="mt-2 text-muted">{c.items.join(", ")}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Certifications() {
  // Group by issuer so the issuer is stated once, in order of first appearance.
  const issuers = [...new Set(certifications.map((c) => c.issuer))];
  return (
    <Section id="certifications">
      <div className={rail}>
        <h2 className="text-2xl font-medium lg:sticky lg:top-24 lg:self-start">Certifications</h2>
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
          {issuers.map((issuer) => (
            <div key={issuer} className="border-t border-line pt-4">
              <h3 className="label">{issuer}</h3>
              <ul className="mt-4 space-y-5">
                {certifications.filter((c) => c.issuer === issuer).map((c) => (
                  <li key={c.id} className="flex gap-4">
                    {c.badge && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.badge} alt={`${c.name} badge`} width={56} height={56} className="h-14 w-14 shrink-0 object-contain" />
                    )}
                    <div>
                      <p className="font-medium leading-snug">{c.name}</p>
                      {c.status === "in-progress" && <p className="mt-1 text-sm text-accent">In progress, not yet earned</p>}
                      {c.verifyUrl && <a href={c.verifyUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm underline underline-offset-4 hover:text-accent">Verify credential</a>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// Evaluated at build time: the page is static, so "Recently added" updates on the next deploy.
const BUILT_AT = Date.now();

export function Credentials() {
  return (
    <Section id="credentials" className="py-20 md:py-28">
      <div className={rail}>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-2xl font-medium">Certificates and badges</h2>
          <p className="label mt-2">{strings.certIntro}</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-8 xl:grid-cols-3">
          {credentials.map((c) => (
            <li key={c.id} className="flex flex-col">
              <div className={`flex aspect-[744/564] items-center justify-center border border-line ${c.kind === "badge" ? "bg-surface" : ""}`}>
                {c.kind === "badge" ? (
                  <Image src={c.image} alt={`${c.name} badge, ${c.issuer}`} width={172} height={172} className="size-[55%] object-contain" />
                ) : (
                  <Image src={c.image} alt={`${c.name} certificate of completion, ${c.issuer}`} width={744} height={564} sizes="(min-width: 1280px) 280px, (min-width: 640px) 45vw, 50vw" className="size-full object-cover" />
                )}
              </div>
              <p className="mt-3 text-[0.9rem] font-medium leading-snug sm:mt-4 sm:text-base">{c.name}</p>
              <p className="label mt-1">{c.issuer} / {c.kind}</p>
              {c.addedOn && BUILT_AT - Date.parse(c.addedOn) < 60 * 86_400_000 && <p className="label mt-1 !text-accent">Recently added</p>}
              {c.pdf && (
                <a href={c.pdf} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 self-start text-sm underline underline-offset-4 hover:text-accent">
                  View PDF <ArrowUpRight size={14} />
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function Contact() {
  const link = "inline-flex items-center gap-2 border border-line px-4 py-3 transition-colors hover:border-fg";
  return (
    <Section id="contact" className="grid gap-14 py-20 md:py-28 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="display text-4xl md:text-6xl">Building something with LLMs that has to work in production?</h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 bg-accent px-5 py-3 font-medium text-accent-ink transition-transform hover:-translate-y-px active:translate-y-px">
            <EnvelopeSimple size={18} /> Send email
          </a>
          <a className={link} href={site.linkedin} target="_blank" rel="noreferrer"><LinkedinLogo size={18} /> LinkedIn</a>
          <a className={link} href={site.github} target="_blank" rel="noreferrer" title={strings.githubTip}><GithubLogo size={18} /> GitHub</a>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="label break-all">{site.email}, {site.phone}</p>
          <CopyButton value={site.email} label="Copy email address" />
        </div>
      </div>
      <dl className="space-y-6">
        <div>
          <dt className="label">Education</dt>
          <dd className="mt-1">{education.degree}<br /><span className="text-muted">{education.school}</span></dd>
        </div>
        <div>
          <dt className="label">Languages</dt>
          <dd className="mt-1">{spoken.join(", ")}</dd>
        </div>
        <div>
          <dt className="label">Based in</dt>
          <dd className="mt-1">{site.location}</dd>
        </div>
      </dl>
    </Section>
  );
}
