// Developer-console command registry. The console is a simulated, read-only portfolio interface:
// input is matched against this fixed allowlist and nothing is ever evaluated or executed.

export const COMMANDS = ["help", "about", "projects", "skills", "experience", "certifications", "contact", "resume", "tour", "clear", "exit"] as const;
export type CommandName = (typeof COMMANDS)[number];
export type Parsed = { ok: true; name: CommandName; args: string[] } | { ok: false; input: string };

const MAX_INPUT = 60;

export function parseCommand(raw: string): Parsed {
  const input = raw.slice(0, MAX_INPUT).trim().replace(/\s+/g, " ");
  const [first = "", ...args] = input.toLowerCase().split(" ");
  const name = COMMANDS.find((c) => c === first);
  // Arguments must be plain words, so shell-like syntax ("help && exit", "ls; x") is rejected outright.
  const plain = args.every((a) => /^[a-z0-9-]{1,24}$/.test(a));
  return name && plain ? { ok: true, name, args } : { ok: false, input };
}

/** Closest allowlisted command by prefix, used only to print a hint. */
export function suggest(input: string): CommandName | null {
  const first = input.trim().toLowerCase().split(" ")[0];
  if (!first) return null;
  return COMMANDS.find((c) => c.startsWith(first)) ?? null;
}
