# Known Gaps and Roadmap

An honest status report as of September 2026, so nobody discovers these the hard way.

## What works today
- The education program is fully specified: session plans, manuals, rubric, safety doctrine, stewardship guide.
- The public website and the Waldo dashboard (live 311 feed plus source links) are online.
- Identity, trust levels, five voting methods, issues, commitments, audit log, rate limiting, admin tokens, paper ballots, and federation run and pass 40 automated checks (`npm test`).
- Kansas City open data and Legistar connectors sync incrementally with retries and a lockfile.
- The safety driver now wraps the identity database and the sync database.

## Fixed in the September 2026 refinement
- Two database migrations were missing from the repo, so voting, issues, the audit log, and rate limits failed on a fresh install. Added `0001_voting_salt.sql` and `0002_issues_audit_ratelimits.sql`; the smoke test went from failing to 35/35.
- `core/meetings-packet.js` had a broken import path that stopped `core/node.js` from loading. Fixed.
- `core/db.js` existed but nothing used it, so the docs' claim of programmatic enforcement wasn't true. It's now wired in; its audit table and `audit_log` reject edits and deletes at the database level.
- The social connector ran by default despite conflicting with the doctrine. Now off unless `NOS_ENABLE_SOCIAL=1`.
- A stale duplicate of the website in `site/` was removed; docs pointed to it as the live source.
- Added `node.config.example.json`, `npm test`, a CI workflow, and corrected setup instructions.

## Known gaps
| Gap | Impact | Suggested fix |
|---|---|---|
| No resident-facing web app for voting, issues, or the problem log | Residents can't use the identity/voting system without a developer | Build a small, static, mobile-first page against `identity/api.js` |
| Email verification returns the token directly (dev mode) | Not safe for public signup | Wire SMTP (already used by the digest) into `/verify-email` |
| `wedges/home-maintenance/` opens SQLite directly, outside the safety driver | Legacy prototype bypasses guardrails | Route through `core/db.js` or archive the wedge |
| Safety driver checks SQL text with pattern matching | Stops mistakes and drift, not a determined insider | Pair with governance, audit review, and least-privilege file access |
| `crime` dataset is synced by default | Legitimate for aggregates but sensitive | Consider disabling by default per neighborhood decision |
| No AI model integration in the codebase yet | Tools must add their own | Add a small `core/llm.js` for local Ollama calls with source-required prompts |
| Jackson County Legislature not synced | County decisions missing from memory | Add a Legistar connector for `jacksonco` |
| Connectors are Kansas City specific | New cities need work | Generalize the Socrata connector by config |

## Suggested roadmap
1. **Now:** run the education program. No code required.
2. **Next:** a public problem log page (static, steward-updated) for Solve clinics.
3. **Then:** the Neighborhood Service Navigator, if the clinics confirm the need.
4. **Later:** resident web app for voting and issues; production email; hub hardware.
