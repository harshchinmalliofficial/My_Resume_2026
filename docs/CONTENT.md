# Content architecture and future admin path

Everything the site says in its own voice is data, not scattered strings.

| Content | Source file | Rendered by |
|---|---|---|
| Robot greetings, chatter, resume and coffee messages, microcopy, display rules, thoughts | `src/content/personality.ts` | `RobotAssistant`, `ResumeViewer`, `FooterExtras`, `ProjectIndex`, 404 |
| Engineering journey stages | `src/content/journey.ts` | `Journey` section |
| Tour steps (built from the data below) | `src/content/tour.ts` | `GuidedTour` |
| Projects, captions (`quip`), metrics, links | `src/data/projects.ts` | project index, case studies, console |
| Experience, capabilities, certifications, credentials (`addedOn` drives "Recently added") | `src/data/profile.ts` | sections, console |
| Identity, URL, resume path | `src/data/site.ts` | metadata, hero, footer |

Pure logic (message selection, repeat avoidance, cooldowns, daily index, console command allowlist) lives in
`src/lib/personality/` and is covered by `npm test`.

## Current state

There is **no admin, CMS, or database** in this project, and none was added. Content changes are edits to the files
above followed by a deploy. A dashboard that only changed browser state would not publish anything, so none exists.

## Migration path (when you want to edit without code)

1. Keep the TypeScript types in the files above as the contract.
2. Pick a source and keep the site static or ISR-rendered from it:
   - Git-based CMS (Decap, Tina): free, edits become commits, no database. Lowest risk.
   - Supabase or similar: row-level security plus a protected admin route. The free tier has limits and can pause
     idle projects; check current pricing before depending on it.
3. Replace the imports in the files above with a loader that returns the same types. Components do not change.
4. Add authentication on the admin route only; never ship a service key to the browser.

## Privacy notes for the personality layer

- Storage holds message ids per session (`sessionStorage`) and one boolean, `psn:visited` (`localStorage`), used to tell
  a returning visitor from a new one. No identifiers, no page history, no resume-page tracking.
- The visitor's greeting uses their own browser clock. No location or profile inference.
- Nothing is sent to a server by these features.
