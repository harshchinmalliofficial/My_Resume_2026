# Harsh Chinmalli, portfolio

Next.js 16 (App Router), TypeScript, Tailwind v4. Content lives in `src/data/`.

```
npm install
npm run dev          # http://localhost:3000
npm run lint && npm run typecheck && npm test && npm run build
```

## "Chat with Harsh" assistant

A 3D robot in the hero opens a chat panel backed by `POST /api/chat` (Google Gemini, server side only).

- **Facts** are generated from the same data files that render the site (`src/lib/chat/knowledge.ts`). Edit `src/data/*`, not the prompt.
- **Model**: `src/lib/chat/provider.ts`, the only file that knows about Gemini. Default `gemini-3.1-flash-lite` (verified live on 2026-10-13); override with `GEMINI_MODEL`. Availability differs per account: in testing `gemini-2.5-*` returned "no longer available to new users" and `gemini-3.5-flash-lite` accepted requests but never answered, so confirm yours. Free-tier replies took roughly 7 to 14 seconds.
- **Robot**: `public/models/robot.glb`, RobotExpressive by Tomas Laulhe (modified by Don McCurdy), CC0 1.0. Clips used: Idle, Running, Jump, Wave, Yes (nod, used for talking).

### The companion robot
`RobotAssistant` is mounted once in `layout.tsx`, so it persists across pages and the conversation survives navigation.

- **Placement (no scroll handlers, no collisions by construction):** at 1400px and wider it sits in the page's right gutter; from 768px to 1399px the layout reserves a right lane (`--lane` in `globals.css`, applied by the `.lane` class on the content containers); below 768px it docks in the sticky header between the logo and the menu, because a floating robot would cover full-width content there. z-index: robot 30, header 40, chat panel 50.
- **States** (`Pose` in `RobotCanvas.tsx`): idle, curious, thinking, anticipate, happy, greeting, celebrate, run, jump, wave, talk. Real clips: Idle, Running, Jump, Wave, Yes, ThumbsUp. Curious, thinking, anticipate and talk layer procedural neck, torso, face-morph and squash motion on top of the clips (the layer is removed before each mixer update, so it cannot accumulate).
- **Rendering:** each canvas gets its own `SkeletonUtils.clone` of the model, renders continuously only while visible and motion is allowed, and falls back to an icon without WebGL.

### Enable the live AI
1. Create a key in Google AI Studio (free tier, no billing needed).
2. Locally: copy `.env.example` to `.env.local`, set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`).
3. On Vercel: add `GEMINI_API_KEY` (and `GEMINI_MODEL`) under Project Settings, Environment Variables. Never prefix them with `NEXT_PUBLIC_`.
4. Optional but recommended: a free Upstash Redis database; set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for rate limits that survive serverless instances. Without them limits are per instance.

Without a key the chat still works: it shows a notice and a clearly labelled saved (non-AI) answer.

### Safeguards
Per-visitor limits (5/min, 30/hour by default) and a global daily ceiling (300), all configurable via `CHAT_*` variables. Input is validated (500 chars per message, 8 messages, 16 KB body). Responses are capped at `CHAT_MAX_OUTPUT_TOKENS`. Cross-origin POSTs are rejected. Free-tier quotas and model availability are set by Google and may change; they are not unlimited.
