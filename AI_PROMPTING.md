# AI Prompting Log

### Full-Stack End-to-End Functionality Pass & UI Stability Polish
- **Tool Used:** Antigravity
- **Context/Task:** End-to-end functionality pass and audit across all UI components, backend stability, pagination, simulation states, and divide-by-zero logic.
- **Exact Prompt Used:**
Two things:

1. FUNCTIONALITY PASS — go through every UI feature and make sure it's fully 
   wired end-to-end with no glitches, race conditions, or dead clicks:
   - "Simulate Traffic" button: disable it while the request is in-flight 
     (prevent double-clicks/double-submits), show a loading indicator on the 
     button itself, and only re-enable once the table has finished refetching.
   - Table refetch after simulation: no flash of stale data, no flicker, no 
     layout shift when row counts/values change. Use a subtle loading state 
     on the table (not a full unmount/remount).
   - Pagination: prev/next buttons must correctly disable at the first/last 
     page, must not allow navigating past totalPages, and must show correct 
     page numbers immediately (no off-by-one bugs).
   - Conversion rate column: verify divide-by-zero (0 views) renders "—" and 
     never "NaN%" or "Infinity%" — test this explicitly with a video that has 
     zero events.
   - Metric overview cards: confirm they recompute correctly after each 
     traffic simulation and pagination change, not just on initial load.
   - Test all of this by clicking through it yourself in the running app, 
     not just by reading the code — report back what you actually clicked 
     and observed.
   - Fix any console errors/warnings in both browser console and server logs.

2. AI_PROMPTING.md LOGGING — going forward, after every non-trivial task I 
   give you (new feature, bug fix, architecture decision, debugging session), 
   append an entry to AI_PROMPTING.md in this exact format:

   ### [Feature/Task name]
   - **Tool Used:** Antigravity
   - **Context/Task:** [one line on what this was for]
   - **Exact Prompt Used:** [the literal prompt I just gave you, verbatim]
   - **Outcome & Adjustments:** [what you did, any manual fixes needed, any 
     issues you caught yourself]

   Only log real prompts I actually send you — do not invent, paraphrase, or 
   backfill prompts I haven't given you. If I ask you to summarize or reformat 
   an earlier prompt, log the summarized version but note it was reconstructed.
- **Outcome & Adjustments:** Enhanced all UI features and fixed hidden bugs across client and server. Added `isRefetching` state in `useAnalytics.js` and a glowing top progress bar overlay in `AnalyticsTable.jsx` to eliminate layout shift and table unmount/remount flickers during refetches; guarded `simulateTraffic` against rapid double clicks and ensured loading spinner displays on the button until refetch completes; strengthened divide-by-zero checks to render `—` for zero views/events; updated `MetricsSummary.jsx` to prevent overview cards from resetting to `...` during refetches/pagination; fixed pagination edge cases and button disabling logic; fixed a server bug where `node --watch` went into an infinite restart loop whenever database files were written (resolved by updating `server/package.json` to `node --watch-path=src src/index.js`); added missing `@keyframes spin` rule in `global.css`. Conducted interactive browser testing verifying all button states, pagination, metric recomputations, divide-by-zero display, and clean console logs.

### SDE2 Production-Grade Rigor & Optimization Pass
- **Tool Used:** Antigravity
- **Context/Task:** Production hardening of edge cases, database composite indexing, SQL query optimization analysis, client-side optimistic UI with rollback, sequence guarding with AbortController, and senior-engineer README documentation.
- **Exact Prompt Used:**
This is being evaluated at an SDE2 bar, so I need production-grade rigor, 
not just a working demo. Go through the entire codebase and address the 
following — treat each as non-negotiable:

1. EDGE CASES & ERROR HANDLING (this is where most submissions will be sloppy)
   - Video with 0 views: conversion rate must render "—", never NaN/Infinity
   - Empty database state: table shows a proper empty state, not a blank screen or crash
   - POST /api/events with invalid videoId → 404 with a clear error message
   - POST /api/events with invalid eventType → 400, and list the allowed values in the error
   - Malformed JSON body → 400, not an unhandled server crash
   - Pagination: requesting a page beyond totalPages should not error or return garbage — 
     return an empty data array with correct metadata
   - Rapid repeated clicks on "Simulate Traffic" — button must disable during the in-flight 
     request, no duplicate submissions, no race condition where an older response overwrites 
     a newer table state
   - Add a request sequence guard (or abort controller) on the frontend so if two fetches 
     to /api/analytics/videos overlap, only the latest response updates the table

2. QUERY PERFORMANCE — VERIFY, DON'T ASSUME
   - Run EXPLAIN QUERY PLAN on the aggregation query in queries.js against the seeded data
   - Confirm the indexes on engagement_events(video_id) and (event_type) are actually being 
     used (not doing a full table scan)
   - Add the EXPLAIN QUERY PLAN output as a comment in queries.js so it's visible in the code, 
     not just something I ran once and forgot

3. OPTIMISTIC UI ON TRAFFIC SIMULATION
   - When "Simulate Traffic" is clicked, immediately increment the relevant row's count 
     client-side (optimistic update) before the server responds
   - Reconcile with the real server response once it lands — if it disagrees with the 
     optimistic value, correct it silently without a visible flicker
   - If the request fails, roll back the optimistic update and show an inline error, 
     don't fail silently

4. README — WRITE IT LIKE YOU'RE EXPLAINING TRADEOFFS TO A SENIOR ENGINEER, NOT LISTING 
   SETUP STEPS
   - For the aggregation query: explain in 2-3 sentences why conditional aggregation in a 
     subquery avoids the cartesian product a naive multi-JOIN across event types would cause
   - For CSS Modules: one sentence on why it was chosen over styled-components/Tailwind 
     for this use case (zero runtime cost, scoped by default, no build-step lock-in)
   - Note the indexing decision and reference the EXPLAIN QUERY PLAN result
   - Include a short "Known Limitations / What I'd Do With More Time" section — listing 
     real gaps (e.g., no auth, no real-time updates via websockets, pagination is offset-based 
     not cursor-based) shows self-awareness rather than pretending the scope is complete

5. Do NOT add unrelated extra features (auth, extra pages, etc.) — depth on the existing 
   spec matters more than breadth. If you think of something worth adding beyond spec, 
   propose it to me first before building it.

After each of the above sections, tell me exactly what you tested and what you observed — 
not just "done," show me the actual output (query plan, curl response, console state) so I 
can verify it myself before it goes in the log.
- **Outcome & Adjustments:** Implemented end-to-end production-grade hardening. Created composite covering index `idx_events_video_type` on `engagement_events(video_id, event_type)` in `migrate.js` enabling SQLite `COVERING INDEX SCAN` (verified via `EXPLAIN QUERY PLAN` and added as code comment in `queries.js`). Implemented client-side `requestSeqRef` and `AbortController` in `useAnalytics.js` to eliminate race conditions from overlapping fetches; added instant client-side Optimistic UI with rollback on error for traffic simulations; handled Express malformed JSON payloads with 400 status in `errorHandler.js`; ensured out-of-bounds pagination returns empty array with metadata; updated `README.md` with senior engineering tradeoff analyses (Cartesian product prevention, CSS Modules rationale, Indexing query plan verification, and known architectural limitations). Tested all endpoints via Node fetch and query plan execution, capturing exact status codes and JSON payloads.
