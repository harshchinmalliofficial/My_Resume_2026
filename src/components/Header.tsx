"use client";
import Link from "next/link";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { nav, site } from "@/data/site";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="lane mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 md:px-8">
        <Link href="/" className="font-medium tracking-tight" onClick={() => setOpen(false)}>
          {site.name}
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm text-muted transition-colors hover:text-fg">{n.label}</Link>
          ))}
        </nav>
        {/* Mobile home of the assistant robot (see RobotAssistant): visible while scrolling, covers no content. */}
        <div id="robot-dock" className="ml-auto mr-1 h-14 md:hidden" />
        <button
          className="-mr-2 p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} weight="regular" /> : <List size={24} weight="regular" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="fadein border-t border-line bg-bg px-5 pb-4 md:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block border-b border-line py-4 text-lg last:border-0">{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
