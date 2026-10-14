"use client";
import { useSyncExternalStore } from "react";
import { Coffee, Compass, Terminal } from "@phosphor-icons/react";
import { coffee, thoughts } from "@/content/personality";
import { emit } from "@/lib/personality/bus";
import { nextMessage } from "@/lib/personality/messages";
import { dailyIndex } from "@/lib/personality/select";

const noop = () => () => {};
const icon = "inline-flex size-11 items-center justify-center text-muted transition-colors hover:text-fg sm:size-9";

// The visitor's own calendar date picks the thought, so it is stable across renders and reloads.
// The server renders the first thought; the client swaps in today's without a layout shift (fixed min-height).
export function DailyThought() {
  const text = useSyncExternalStore(
    noop,
    () => {
      const d = new Date();
      return thoughts[dailyIndex(d.getFullYear(), d.getMonth(), d.getDate(), thoughts.length)];
    },
    () => thoughts[0],
  );
  return (
    <p className="min-h-[2.75rem] max-w-[52ch] text-sm leading-snug sm:min-h-[2.5rem]">
      <span className="label mr-2 uppercase">Engineering thought</span>
      <span className="text-fg">{text}</span>
    </p>
  );
}

export function FooterButtons() {
  const sip = () => {
    const m = nextMessage("coffee", coffee);
    if (!m) return;
    emit({ type: "toast", text: m.text });
    emit({ type: "robot", pose: "celebrate" });
  };
  return (
    <div className="flex items-center">
      <button type="button" onClick={() => emit({ type: "tour", mode: "quick" })} aria-label="Start the quick tour" title="Quick tour" className={icon}>
        <Compass size={18} />
      </button>
      <button type="button" onClick={() => emit({ type: "open-console" })} aria-label="Open developer mode" title="Developer mode (Ctrl or Cmd + Shift + K)" className={icon}>
        <Terminal size={18} />
      </button>
      <button type="button" onClick={sip} aria-label="Coffee" title="Coffee" className={icon}>
        <Coffee size={18} />
      </button>
    </div>
  );
}
