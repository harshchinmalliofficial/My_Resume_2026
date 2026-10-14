// Pure helpers (no DOM, no imports) so they can be unit tested with `npm test`.

export type Period = "morning" | "afternoon" | "evening" | "night";

/** Maps a local hour (0-23) to a period. Always called with the visitor's own browser hour. */
export function dayPeriod(hour: number): Period {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

/**
 * Picks a message the visitor has not seen recently. `recent` holds ids already shown this session.
 * When the pool is exhausted it starts over, but never repeats the very last message back to back.
 */
export function pickMessage<T extends { id: string }>(
  pool: readonly T[],
  recent: readonly string[],
  rng: () => number = Math.random,
): { message: T; recent: string[] } | null {
  if (pool.length === 0) return null;
  let fresh = pool.filter((m) => !recent.includes(m.id));
  let history = [...recent];
  if (fresh.length === 0) {
    const last = recent[recent.length - 1];
    fresh = pool.length > 1 ? pool.filter((m) => m.id !== last) : [...pool];
    history = [];
  }
  const message = fresh[Math.min(fresh.length - 1, Math.floor(rng() * fresh.length))];
  return { message, recent: [...history, message.id] };
}

export type ShowState = { shown: number; lastAt: number | null; dismissed: boolean };
export type ShowRule = { max: number; minGapMs: number };

/** Frequency limit plus cooldown. A dismissed message stream stays off for the session. */
export function canShow(state: ShowState, rule: ShowRule, now: number): boolean {
  if (state.dismissed) return false;
  if (state.shown >= rule.max) return false;
  if (state.lastAt !== null && now - state.lastAt < rule.minGapMs) return false;
  return true;
}

/** Deterministic index for a calendar date (month is 0-based), stable across renders and reloads. */
export function dailyIndex(year: number, month: number, day: number, length: number): number {
  if (length <= 0) return 0;
  return Math.floor(Date.UTC(year, month, day) / 86_400_000) % length;
}
