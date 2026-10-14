import { site } from "@/data/site";
import { strings } from "@/content/personality";
import { DailyThought } from "./FooterExtras";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="lane mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-8 text-sm text-muted md:flex-row md:justify-between md:px-8">
        <p>{site.name}, {site.location}</p>
        <p className="flex gap-6">
          <a className="hover:text-fg" href={site.github} target="_blank" rel="noreferrer" title={strings.githubTip}>GitHub</a>
          <a className="hover:text-fg" href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="hover:text-fg" href={`mailto:${site.email}`}>Email</a>
        </p>
      </div>
      <div className="lane mx-auto flex max-w-[1280px] flex-col gap-3 border-t border-line px-5 py-5 md:px-8">
        <DailyThought />
      </div>
    </footer>
  );
}
