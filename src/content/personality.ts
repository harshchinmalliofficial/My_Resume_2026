// Single source for every personality string and display rule on the site.
// Pure data, no imports: easy to unit test, and the shape a CMS could later serve (see docs/CONTENT.md).
// Original copy only. Messages never claim an action succeeded; success text is shown only after the action confirms.

export type Msg = { id: string; text: string; actions?: ("quick-tour" | "deep-dive")[] };
const pool = (prefix: string, items: (string | [string, Msg["actions"]])[]): Msg[] =>
  items.map((it, i) => (typeof it === "string" ? { id: `${prefix}${i}`, text: it } : { id: `${prefix}${i}`, text: it[0], actions: it[1] }));

export const SIDEKICK_LABEL = "Harsh's AI Sidekick";

// Time-aware greetings (visitor's local hour is mapped to one of these pools in the browser).
export const greetings = {
  morning: pool("gm", ["Fresh coffee, fresh ideas. Welcome in. ☕", "Good morning. Ready to explore some engineering?"]),
  afternoon: pool("ga", ["Taking a break from the chaos? Explore something interesting.", "A good time for a quick tour of some AI systems."]),
  evening: pool("ge", ["Evening mode: ON. Interesting projects ahead.", "Welcome in. There's more here than meets the eye."]),
  night: pool("gn", ["Still exploring? The best debugging stories often start after dark. 🌙", "A fellow night owl? No assumptions, but you're welcome here."]),
  returning: pool("gr", ["Welcome back. Same engineer, same robot, possibly new details.", "Good to see you again. The case studies go deeper than the homepage."]),
};

// Occasional robot chatter, shown after the greeting within the limits in `rules`.
export const chatter = pool("rc", [
  "Hey, I'm Harsh's digital sidekick. He's the engineer; I'm the unsolicited tour guide. 🤖",
  "Psst. There's some interesting AI engineering around here.",
  "I was told to look professional. Then someone gave me a wave animation.",
  "Curious about Harsh? Ask away. I know the public portfolio facts.",
  "Welcome aboard. Try not to deploy anything on Friday.",
  ["Need the short version or the technical deep dive?", ["quick-tour", "deep-dive"]],
]);

export const resumeViewer = pool("rv", [
  "The extended cut of my engineering story. 📄",
  "Achievement unlocked: professional background discovered.",
  "No pop quiz at the end, promise.",
  "The projects section has more of the story.",
]);
export const resumeClosed = pool("rx", ["The projects section has more of the story.", "Resume done. The case studies go deeper."]);
export const tourDone = pool("td", ["Tour complete. Questions? I know the public portfolio facts."]);
export const coffee = pool("cf", [
  "Coffee acquired. Debugging may continue. ☕",
  "Side quest completed: you found the tiny detail.",
  "One small interaction for you, one unnecessary animation for my robot.",
]);

export const strings = {
  copyOk: "Copied. Your clipboard and I are now collaborating.",
  copyFail: "Copy didn't work. Try selecting the text manually.",
  githubTip: "Warning: may contain commits.",
  emptyFilter: "No matches. Even semantic search has its limits.",
  notFound: "Looks like this route escaped orchestration.",
  certIntro: "Proof that the curiosity wasn't just theoretical.",
  consoleHello: "Portfolio console. A simulated, read-only interface; no real shell. Type help.",
};

// Display rules: nothing here interrupts the visitor more than a small, dismissible bubble.
export const rules = {
  greetingDelayMs: 2500,
  bubbleMs: 9000,
  bubbleWithActionsMs: 15000,
  chatter: { max: 2, firstAfterMs: 45000, minGapMs: 60000 },
  nudge: { max: 1, minGapMs: 0 },
  toastMs: 4500,
};

// Original observations. Not quotes; not attributed to anyone.
export const thoughts: string[] = [
  "A good demo proves it works once. Good engineering proves it keeps working.",
  "Automation is most useful when failure is observable.",
  "A clever prompt is nice. A reliable system is better.",
  "The best interface makes complexity feel manageable.",
  "If you can't measure the improvement, you have an opinion.",
  "Retrieval quality sets the ceiling for what the model can say.",
  "Guardrails are a feature, not a tax on one.",
  "The boring part of a system is usually the part that pages you.",
];
