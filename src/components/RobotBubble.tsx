"use client";
import { motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { SIDEKICK_LABEL } from "@/content/personality";
import type { Say } from "@/lib/personality/bus";

const ACTIONS = { "quick-tour": "Quick tour", "deep-dive": "Deep dive" } as const;

// Separate from the chat panel: a small, dismissible, polite status message beside the robot.
export function RobotBubble({ say, onDismiss, onAction }: { say: Say; onDismiss: () => void; onAction: (a: "quick-tour" | "deep-dive") => void }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      role="status"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.25 }}
      className="pointer-events-auto w-[min(17rem,calc(100vw-1.5rem))] border border-line bg-surface p-3 text-left shadow-[0_6px_24px_rgb(0_0_0/0.3)]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="label uppercase !text-accent">{SIDEKICK_LABEL}</p>
        <button type="button" onClick={onDismiss} aria-label="Dismiss message" className="-m-2 p-2 text-muted hover:text-fg">
          <X size={14} />
        </button>
      </div>
      <p className="mt-1.5 text-sm leading-snug">{say.text}</p>
      {say.actions && (
        <div className="mt-3 flex flex-wrap gap-2">
          {say.actions.map((a) => (
            <button key={a} type="button" onClick={() => onAction(a)} className="h-9 border border-line px-3 text-sm transition-colors hover:border-fg">
              {ACTIONS[a]}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
