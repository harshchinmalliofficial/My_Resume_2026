// Fixed-window limiter. Durable when Upstash Redis (REST) is configured, otherwise per-instance memory.
// ponytail: memory mode resets per serverless instance; add the Upstash env vars for a durable limit.
export type Store = { incr(key: string, ttlSeconds: number): Promise<number> };
export type Config = { perMinute: number; perHour: number; perDay: number };
export type Result = { allowed: true } | { allowed: false; code: "rate_limited" | "daily_limit"; retryAfter: number };

export function configFromEnv(env: Record<string, string | undefined>): Config {
  const n = (v: string | undefined, d: number) => (v && Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : d);
  return { perMinute: n(env.CHAT_RATE_LIMIT_PER_MIN, 5), perHour: n(env.CHAT_RATE_LIMIT_PER_HOUR, 30), perDay: n(env.CHAT_DAILY_LIMIT, 300) };
}

export function memoryStore(): Store {
  const m = new Map<string, { n: number; exp: number }>();
  return {
    async incr(key, ttl) {
      const now = Date.now();
      if (m.size > 5000) for (const [k, v] of m) if (v.exp < now) m.delete(k);
      const cur = m.get(key);
      if (!cur || cur.exp < now) {
        m.set(key, { n: 1, exp: now + ttl * 1000 });
        return 1;
      }
      return ++cur.n;
    },
  };
}

export function upstashStore(url: string, token: string): Store {
  return {
    async incr(key, ttl) {
      const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([["INCR", key], ["EXPIRE", key, String(ttl), "NX"]]),
        signal: AbortSignal.timeout(2500),
      });
      if (!res.ok) throw new Error(`upstash ${res.status}`);
      const data = (await res.json()) as { result?: number }[];
      return Number(data[0]?.result);
    },
  };
}

// Per-visitor limits are checked first so one visitor cannot burn the shared daily ceiling.
export async function checkLimits(store: Store, visitor: string, cfg: Config, now = Date.now()): Promise<Result> {
  const s = Math.floor(now / 1000);
  const windows: [string, number, number, "rate_limited"][] = [
    ["m", 60, cfg.perMinute, "rate_limited"],
    ["h", 3600, cfg.perHour, "rate_limited"],
  ];
  for (const [tag, ttl, max, code] of windows) {
    const n = await store.incr(`chat:${tag}:${Math.floor(s / ttl)}:${visitor}`, ttl);
    if (n > max) return { allowed: false, code, retryAfter: ttl - (s % ttl) };
  }
  const day = await store.incr(`chat:d:${Math.floor(s / 86400)}`, 86400);
  if (day > cfg.perDay) return { allowed: false, code: "daily_limit", retryAfter: 86400 - (s % 86400) };
  return { allowed: true };
}
