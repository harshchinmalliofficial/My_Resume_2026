import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight } from "@phosphor-icons/react/dist/ssr";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { site } from "@/data/site";
import { HeroFlow } from "./HeroFlow";
import { ResumeButton } from "./ResumeButton";

const v = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function Hero() {
  // Link straight to the PDF when it exists; otherwise fall back to the on-page experience.
  const hasResume = existsSync(join(process.cwd(), "public", site.resumeFile));
  const hasPortrait = existsSync(join(process.cwd(), "public", "images", "harsh-portrait.webp"));
  return (
    <section className="lane mx-auto max-w-[1280px] px-5 pb-16 pt-10 md:px-8 lg:pb-20 lg:pt-14">
      <div className="grid items-center gap-10 md:grid-cols-[1.7fr_1fr] md:gap-8 lg:gap-14">
        <div className="min-w-0">
          <h1 className="display rise text-[clamp(2.1rem,1rem+3.6vw,4.4rem)]" style={v(0)}>
            I build AI systems that reason, retrieve, and <span className="text-accent">act.</span>
          </h1>
          <p className="rise mt-7 max-w-[50ch] text-lg leading-relaxed text-muted" style={v(1)}>
            Engineering production-grade LLM applications, retrieval systems, and agentic workflows, with a focus on reliability, evaluation, and real-world constraints.
          </p>
          <div className="rise mt-7 flex flex-wrap gap-3" style={v(2)}>
            <Link href="/#work" className="inline-flex items-center gap-2 whitespace-nowrap bg-accent px-5 py-3 font-medium text-accent-ink transition-transform hover:-translate-y-px active:translate-y-px">
              Explore My Work <ArrowDownRight size={18} />
            </Link>
            <ResumeButton src={hasResume ? encodeURI(site.resumeFile) : null} fallbackHref="/#experience" />
          </div>
        </div>

        <div className="rise mx-auto flex w-full max-w-[400px] flex-col items-center text-center" style={v(1)}>
          {hasPortrait && (
            <div className="group relative aspect-square w-[min(100%,15rem)] md:w-full">
              <span aria-hidden className="absolute inset-0 translate-x-2 translate-y-1.5 border border-accent/60 [border-radius:46%_54%_41%_59%/57%_43%_57%_43%]" />
              <Image
                src="/images/harsh-portrait.webp"
                alt="Portrait of Harsh Chinmalli"
                width={720}
                height={720}
                sizes="(min-width: 768px) 400px, 240px"
                priority
                className="relative size-full border border-line object-cover [border-radius:58%_42%_53%_47%/46%_56%_44%_54%] [object-position:50%_40%] transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
              />
            </div>
          )}
          <p className="display mt-6 text-2xl md:text-3xl">{site.name}</p>
          <p className="label mt-1.5 uppercase">Software Engineer / AI Systems</p>
        </div>
      </div>

      <div className="rise mt-14" style={v(3)}>
        <HeroFlow />
      </div>
    </section>
  );
}
