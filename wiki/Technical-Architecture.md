# Technical Architecture

NeighborhoodOS software is a small, local-first Node.js codebase built on SQLite. It is designed so one neighborhood can run its own node on one machine, and optionally share aggregate results with other neighborhoods.

**You do not need any of this to run the education program.** Read this when a Build or the data layer is on the table.

## At a glance

```
                   Public sources                         Residents
        (KC Open Data, Legistar, county/state)        (sessions, open hours)
                          │                                   │
                          ▼                                   ▼
   ┌───────────────── connectors/ ──────────────┐    ┌──── identity/api.js ────┐
   │ kc-open-data.js   legistar.js   social.js* │    │ signup, trust levels,   │
   │ commonweave-directory.js (optional)        │    │ proposals & voting,     │
   └───────────────────┬────────────────────────┘    │ issues, commitments,    │
                       │ ingest/sync.js (cron)       │ federation, audit       │
                       ▼                              └────────────┬────────────┘
             ┌──────────────────────────────────────────────────────┐
             │   SQLite node database  (one file per neighborhood)   │
             │   wrapped by core/db.js: the safety driver             │
             │   blocks banned tables/fields, append-only audit log   │
             └──────────────────────────────────────────────────────┘
                       │                                   │
                       ▼                                   ▼
          digests, meeting packets,              federation bundles
          dashboards, small tools                (aggregates only) ──► other nodes

   * social.js is disabled by default. See Safety Doctrine.
```

## Repository map

| Path | What it is | Status |
|---|---|---|
| `index.html`, `learn/`, `local/`, `pilot/`, `launch.html` | Public website, served by GitHub Pages from `main` | Live |
| `core/db.js` | **Safety driver.** Wraps every node database; refuses banned tables, columns, and patterns; logs blocked attempts to an append-only table | Working, tested |
| `core/node.js` | One import for the whole API; `createNode()` spins up a node | Working |
| `core/llm.js` | Local AI helper for tools: source-grounded answers, citations, PII redaction, local-host-only by default | Working, tested with a fake model |
| `core/meetings-packet.js` | Builds printable meeting packets (PDF) from Legistar | Working, needs live testing |
| `connectors/kc-open-data.js` | Incremental sync from Kansas City's Socrata open data portal | Working (network required) |
| `connectors/legistar.js` | Kansas City council matters and events; commitment tracking | Working (network required) |
| `connectors/social.js` | Nextdoor / Facebook group signals | **Disabled by default**; conflicts with doctrine unless consented and scoped |
| `connectors/commonweave-directory.js` | Optional lookup of commons-aligned orgs nearby | Optional |
| `connectors/_fetch.js` | Shared HTTP with retries and backoff | Working |
| `ingest/sync.js`, `ingest/probe.js` | Cron-ready sync of all sources with a lockfile; health probe | Working |
| `identity/` | Civic identity, trust levels, voting (5 methods), issues, commitments, federation, audit, rate limits, admin tokens, paper ballots, digests, HTTP API | Working; `npm test` runs 46 automated checks |
| `identity/migrations/` | Numbered SQL migrations applied on open | Working |
| `wedges/home-maintenance/` | First prototype "wedge" (home repair in West Waldo) | **Archived**; bypasses the safety driver, don't deploy |
| `docs/` | Full manuals: workshops, rubric, safety, stewardship, data, compute | Current |
| `wiki/` | This wiki | Current |
| `node.config.example.json` | Per-neighborhood settings template | Current |

## Key design choices

**One SQLite file per neighborhood.** Easy to back up (copy a file), easy to delete, runs on anything. Postgres is unnecessary at this scale.

**Safety in code, not just prose.** `core/db.js` wraps the database connection used by the identity system and the sync job. Attempts to create or query things like `resident_dossiers`, `risk_score`, or `police_predictions` throw a `CivicSafetyViolationError` and are logged. The audit tables reject UPDATE and DELETE at the database level. This is a guardrail against mistakes and drift, not a guarantee against a determined bad actor with direct file access. Governance still matters.

**Blinded voting.** Each voter's ID is blinded per proposal with an HMAC, so tallies are verifiable but individual votes can't be traced to people, even with database access. Receipts let voters confirm their vote counted.

**Trust levels, not identity checks.** People start anonymous (level 0) and earn trust through email verification, neighbor vouching, or two-coordinator address checks. Most activities need only level 2-3.

**Federation shares aggregates only.** Neighborhoods can exchange signed bundles of counts and closed-vote tallies. Raw records never leave a node. Bundles are signed, replay-protected, and expire after 24 hours.

**No outbound automated decisions.** Tools suggest, summarize, and draft. A human acts.

## Where the AI models fit

AI enters in two ways:
1. **In sessions**, through a facilitator-run chat tool.
2. **In a Build**, where a tool calls a *local* model hosted by Ollama on the hub workstation through `core/llm.js`, which enforces source-grounding, citations, redaction, and local-only hosting. See [Building a Tool](Building-a-Tool.md) and the [Local Compute Guide](../docs/LOCAL-COMPUTE-GUIDE.md).

## Honest status

See [Known Gaps and Roadmap](Known-Gaps-and-Roadmap.md). Short version: the identity, voting, federation, and data-sync code runs and is tested; there is no finished resident-facing web app for it yet; the public website and dashboard are live; the education program is fully specified.
