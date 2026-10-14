"use client";
import { useSyncExternalStore } from "react";
import { Moon, Sun, SunHorizon } from "@phosphor-icons/react";
import { heroWishFor } from "@/lib/personality/messages";
import { dayPeriod, parseAccent } from "@/lib/personality/select";

const noop = () => () => {};
// Script letters lean and overhang, so each accent word gets a little breathing room on its right, and any
// punctuation that follows it (":", "?", ".") is kept on the same line instead of wrapping alone.
function nodes(line: string) {
  const segs = parseAccent(line);
  return segs.map((seg, i) => {
    if (seg.accent) {
      const next = segs[i + 1];
      const tail = next && !next.accent ? (next.text.match(/^[^\s]+/)?.[0] ?? "") : "";
      return (
        <span key={i} className="whitespace-nowrap">
          <span className="font-script text-[1.35em] font-semibold leading-none text-accent">{seg.text}</span>
          <span className="ml-[0.12em]">{tail}</span>
        </span>
      );
    }
    const prev = segs[i - 1];
    const skip = prev?.accent ? (seg.text.match(/^[^\s]+/)?.[0] ?? "").length : 0;
    return <span key={i}>{seg.text.slice(skip)}</span>;
  });
}

const ICON = { morning: Sun, afternoon: Sun, evening: SunHorizon, night: Moon } as const;

// Time-aware line above the headline, from the visitor's own browser clock (never the owner's).
// Plain text in the body colour; the starred words are set in the orange script accent.
// The server renders an empty row of fixed height, so filling it in causes no layout shift.
export function HeroWish() {
  const text = useSyncExternalStore(
    noop,
    () => {
      const now = new Date();
      return `${dayPeriod(now.getHours())}\n${heroWishFor(dayPeriod(now.getHours()), now)}`;
    },
    () => null,
  );
  const [period, line] = text ? (text.split("\n") as [keyof typeof ICON, string]) : [null, ""];
  const Icon = period ? ICON[period] : null;
  return (
    <p className="mb-5 flex min-h-[3.25rem] items-center gap-3 text-xl font-medium sm:min-h-[2.75rem] sm:text-3xl" aria-live="off">
      {Icon && <Icon size={22} className="shrink-0 text-accent" aria-hidden />}
      <span className="text-balance">
        {nodes(line)}
      </span>
    </p>
  );
}
