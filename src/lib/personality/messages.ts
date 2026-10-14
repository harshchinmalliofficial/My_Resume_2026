// Browser-side message selection with session memory. Storage holds only message ids and booleans
// (no identifiers, no page history) and every access is wrapped, so private modes simply behave statelessly.
import { greetings, type Msg } from "@/content/personality";
import { dayPeriod, pickMessage } from "./select";

const S = (): Storage | null => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};
const L = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/** Next unseen message from `pool`, remembering ids per session under `key`. */
export function nextMessage(key: string, pool: readonly Msg[]): Msg | null {
  const s = S();
  let recent: string[] = [];
  try {
    recent = JSON.parse(s?.getItem(`psn:recent:${key}`) ?? "[]");
  } catch {}
  const r = pickMessage(pool, Array.isArray(recent) ? recent : []);
  if (!r) return null;
  try {
    s?.setItem(`psn:recent:${key}`, JSON.stringify(r.recent));
  } catch {}
  return r.message;
}

/** True when this browser has opened the site in an earlier session. Stores one boolean. */
export function isReturningVisitor(): boolean {
  const s = S();
  const cached = s?.getItem("psn:returning");
  if (cached !== null && cached !== undefined) return cached === "1";
  const l = L();
  const returning = l?.getItem("psn:visited") === "1";
  try {
    l?.setItem("psn:visited", "1");
    s?.setItem("psn:returning", returning ? "1" : "0");
  } catch {}
  return returning;
}

/** Greeting for this visitor, from their own browser clock. Returning visitors get a different pool. */
export function pickGreeting(): Msg | null {
  if (isReturningVisitor()) return nextMessage("greet-returning", greetings.returning);
  return nextMessage(`greet-${dayPeriod(new Date().getHours())}`, greetings[dayPeriod(new Date().getHours())]);
}

/** Once-per-session flag helper. Returns true the first time it is called for `key`. */
export function firstThisSession(key: string): boolean {
  const s = S();
  if (!s) return true;
  try {
    if (s.getItem(`psn:once:${key}`)) return false;
    s.setItem(`psn:once:${key}`, "1");
  } catch {}
  return true;
}
