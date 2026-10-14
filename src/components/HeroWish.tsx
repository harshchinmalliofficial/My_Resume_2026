"use client";
import { useSyncExternalStore } from "react";
import { Moon, Sun, SunHorizon } from "@phosphor-icons/react";
import { heroWish } from "@/content/personality";
import { dayPeriod } from "@/lib/personality/select";

const noop = () => () => {};
const ICON = { morning: Sun, afternoon: Sun, evening: SunHorizon, night: Moon } as const;

// Time-aware line above the headline, from the visitor's own browser clock (never the owner's).
// The server renders an empty, fixed-height row, so filling it in causes no layout shift.
export function HeroWish() {
  const period = useSyncExternalStore(noop, () => dayPeriod(new Date().getHours()), () => null);
  const Icon = period ? ICON[period] : null;
  return (
    <p className="mb-5 flex h-6 items-center gap-2 font-mono text-sm text-accent" aria-live="off">
      {period && Icon && (
        <>
          <Icon size={16} aria-hidden />
          <span>{heroWish[period]}</span>
        </>
      )}
    </p>
  );
}
