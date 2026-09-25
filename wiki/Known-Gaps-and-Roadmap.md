# Known Gaps and Roadmap

An honest status report as of September 2026, so nobody discovers these the hard way.

## What works today
- The education program is fully specified: session plans, manuals, rubric, safety doctrine, stewardship guide.
- The public website and the Waldo dashboard (current 311 requests in a Waldo box, plus source links) are online.
- Identity, trust levels, five voting methods, issues, commitments, audit log, rate limiting, admin tokens, paper ballots, and federation run and pass 46 automated checks (`npm test`), including the local AI helper.
- Kansas City open data and Legistar connectors sync incrementally with retries and a lockfile.
- The safety driver now wraps the identity database and the sync database.

## Fixed in the September 2026 refinement
- Two database migrations were missing from the repo, so voting, issues, the audit log, and rate limits failed on a fresh install. Added `0001_voting_salt.sql` and `0002_issues_audit_ratelimits.sql`; the smoke test went from failing to 35/35.
- `core/meetings-packet.js` had a broken import path that stopped `core/node.js` from loading. Fixed.
- `core/db.js` existed but nothing used it, so the docs' claim of programmatic enforcement wasn't true. It's now wired in; its audit table and `audit_log` reject edits and deletes at the database level.
- The social connector ran by default despite conflicting with the doctrine. Now off unless `NOS_ENABLE_SOCIAL=1`.
- A stale duplicate of the website in `site/` was removed; docs pointed to it as the live source.
- Added `node.config.example.json`, `npm test`, a CI workflow, and corrected setup instructions.
- Added `core/llm.js`, a local-model helper that enforces source-grounded answers, citations, PII redaction, and local-only hosting.
- Archived the `wedges/home-maintenance/` prototype with a clear warning.
- Website: new homepage with an interactive "catch the machine" exercise and problem-brief builder, a free self-paced lesson at `/learn/`, and a printable facilitator kit at `/kit/`.
- The Waldo dashboard and the 311 connector pointed at DataKC's archived 311 dataset (`7at3-sxhp`, which ends in March 2021), so "live" rows were five years old. Both now use the current dataset (`d4px-6rwg`), filtered to a Waldo box, and never request the free-text field that can hold phone numbers. The dashboard's "Report a city issue" button now opens myKCMO instead of a data map.
- The one-line description, README, `llms.txt`, and wiki now say the same thing, and give one contact.

## Known gaps
| Gap | Impact | Suggested fix |
|---|---|---|
| No resident-facing web app for voting, issues, or the problem log | Residents can't use the identity/voting system without a developer | Build a small, static, mobile-first page against `identity/api.js` |
| Email verification returns the token directly (dev mode) | Not safe for public signup | Wire SMTP (already used by the digest) into `/verify-email` |
| Safety driver checks SQL text with pattern matching | Stops mistakes and drift, not a determined insider | Pair with governance, audit review, and least-privilege file access |
| `crime` dataset is synced by default | Legitimate for aggregates but sensitive | Consider disabling by default per neighborhood decision |
| Jackson County Legislature not synced | County decisions missing from memory | Add a Legistar connector for `jacksonco` |
| Connectors are Kansas City specific | New cities need work | Generalize the Socrata connector by config |
| `core/llm.js` is tested with a fake model, not yet against a live Ollama install | First real Build should confirm it | Run one real query on the hub workstation |
| Non-code materials have no formal license file yet | Funders may ask | Author to choose (e.g., CC BY 4.0); see [Handoff and Licensing](Handoff-and-Licensing.md) |
| Library, Documenters, and CivicAI partnerships are proposed, not agreed | Can't be claimed in outreach yet | Approach each; see [Partners](Partners.md) |
| Site loads fonts from Google | Google sees visitor IPs | Self-host the fonts; see [Threat Model](Threat-Model.md) |

## Suggested roadmap
1. **Now:** approach the Waldo Branch library and Kansas City Documenters; apply for stipend funding with the library.
2. **Then:** run the first paid cohort (3 Learn, 2 Solve), measuring problems resolved, AI-error spotting, and peer helper retention.
3. **Next:** a public problem log page (static, steward-updated) for Solve clinics.
4. **Only if residents ask:** the Neighborhood Service Navigator, a resident app for voting and issues, hub hardware. See [Later, if residents want it](Later-If-Residents-Want-It.md).
