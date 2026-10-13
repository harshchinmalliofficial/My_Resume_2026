// Maps provider failures to a stable kind and HTTP status without leaking provider details.
export type Kind = "config" | "quota" | "timeout" | "upstream" | "empty";

export class ProviderError extends Error {
  kind: Kind;
  constructor(kind: Kind, message: string) {
    super(message);
    this.kind = kind;
  }
}

export function classifyError(err: unknown): Kind {
  if (err instanceof ProviderError) return err.kind;
  const e = err as { name?: string; status?: number; code?: number | string; message?: string } | null;
  const msg = String(e?.message ?? "");
  const status = Number(e?.status ?? e?.code);
  if (e?.name === "AbortError" || e?.name === "TimeoutError" || /timed? ?out|aborted/i.test(msg)) return "timeout";
  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(msg)) return "quota";
  if (status === 401 || status === 403 || /API key|PERMISSION_DENIED|UNAUTHENTICATED/i.test(msg)) return "config";
  return "upstream";
}

export const HTTP: Record<Kind, { status: number; code: string; message: string }> = {
  config: { status: 503, code: "not_configured", message: "The live AI assistant is not available right now." },
  quota: { status: 429, code: "provider_quota", message: "The AI provider's free allowance is used up for now. Please try again later." },
  timeout: { status: 504, code: "timeout", message: "The assistant took too long to respond." },
  upstream: { status: 502, code: "upstream", message: "The AI service had a problem. Please try again." },
  empty: { status: 502, code: "empty", message: "The assistant returned no answer." },
};
