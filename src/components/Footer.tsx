import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="lane mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-8 text-sm text-muted md:flex-row md:justify-between md:px-8">
        <p>{site.name}, {site.location}</p>
        <p className="flex gap-6">
          <a className="hover:text-fg" href={site.github} target="_blank" rel="noreferrer">GitHub</a>
          <a className="hover:text-fg" href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="hover:text-fg" href={`mailto:${site.email}`}>Email</a>
        </p>
      </div>
    </footer>
  );
}
