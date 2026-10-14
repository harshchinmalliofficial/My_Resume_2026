import Link from "next/link";
import { strings } from "@/content/personality";
import { RobotReaction } from "@/components/RobotReaction";

export default function NotFound() {
  return (
    <section className="lane mx-auto flex min-h-[70dvh] max-w-[1280px] flex-col justify-center px-5 md:px-8">
      <RobotReaction pose="curious" />
      <p className="label">404</p>
      <h1 className="display mt-3 text-5xl md:text-7xl">{strings.notFound}</h1>
      <p className="mt-5 max-w-[50ch] text-lg text-muted">The link may be old or mistyped. The work is one click away.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="bg-accent px-5 py-3 font-medium text-accent-ink transition-transform hover:-translate-y-px active:translate-y-px">Back to home</Link>
        <Link href="/#work" className="border border-fg/40 px-5 py-3 font-medium transition-colors hover:border-fg">See the projects</Link>
      </div>
    </section>
  );
}
