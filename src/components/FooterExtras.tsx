"use client";
import { useSyncExternalStore } from "react";
import { Coffee, Compass, Terminal } from "@phosphor-icons/react";
import { coffee, thoughts } from "@/content/personality";
import { emit } from "@/lib/personality/bus";
import { nextMessage } from "@/lib/personality/messages";
import { dailyIndex } from "@/lib/personality/select";

const noop = () => () => {};

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

// Tour, developer mode and coffee. Lives in the header (icons on desktop, labelled rows in the mobile menu).
export function QuickTools({ labelled = false, onDone }: { labelled?: boolean; onDone?: () => void }) {
  const sip = () => {
    const m = nextMessage("coffee", coffee);
    if (!m) return;
    emit({ type: "toast", text: m.text });
    emit({ type: "robot", pose: "celebrate" });
  };
  const items = [
    { Icon: Compass, label: "Quick tour", title: "Quick tour", run: () => emit({ type: "tour", mode: "quick" }) },
    { Icon: Terminal, label: "Developer mode", title: "Developer mode (Ctrl or Cmd + Shift + K)", run: () => emit({ type: "open-console" }) },
    { Icon: Coffee, label: "Coffee", title: "Coffee", run: sip },
  ];
  return (
    <div className={labelled ? "grid grid-cols-3 gap-2 py-4" : "flex items-center"}>
      {items.map(({ Icon, label, title, run }) => (
        <button
          key={label}
          type="button"
          onClick={() => {
            onDone?.();
            run();
          }}
          aria-label={label}
          title={title}
          className={labelled ? "flex h-14 flex-col items-center justify-center gap-1 border border-line text-xs text-muted hover:text-fg" : "inline-flex size-9 items-center justify-center text-muted transition-colors hover:text-fg"}
        >
          <Icon size={labelled ? 20 : 18} />
          {labelled && label}
        </button>
      ))}
    </div>
  );
}
