// A tiny typed event bus. Sections ask the robot (or the toaster, tour, console) to react without
// importing any of them, so features stay decoupled. Client-only; listeners are removed by the returned function.
import type { Pose } from "@/components/RobotCanvas";

export type Say = { id: string; text: string; actions?: ("quick-tour" | "deep-dive")[]; force?: boolean };
export type PersonalityEvent =
  | { type: "robot"; pose?: Pose; say?: Say }
  | { type: "modal"; id: string; open: boolean }
  | { type: "toast"; text: string; tone?: "ok" | "error" }
  | { type: "open-resume" }
  | { type: "open-console" }
  | { type: "tour"; mode: "quick" | "deep" }
  | { type: "tour-finished" };

const listeners = new Set<(e: PersonalityEvent) => void>();

export function emit(e: PersonalityEvent) {
  listeners.forEach((l) => l(e));
}

export function subscribe(fn: (e: PersonalityEvent) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
