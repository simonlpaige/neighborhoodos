# NeighborhoodOS

**Free, practical AI help for Waldo neighbors, plus clinics for stuck civic problems.**

Live site: [neighborhoodos.org](https://neighborhoodos.org) · **Wiki: [start here](wiki/Home.md)** · Free lesson: [neighborhoodos.org/learn](https://neighborhoodos.org/learn/) · Facilitator kit: [neighborhoodos.org/kit](https://neighborhoodos.org/kit/) · Contact: [simon@simonlpaige.com](mailto:simon@simonlpaige.com)

> **Open for community use.** Any organization can run the program under the [Safety Doctrine](wiki/Safety-Doctrine.md). See [Handoff and Licensing](wiki/Handoff-and-Licensing.md).

---

## What this is

1. **Practical AI help (Learn).** Free sessions where neighbors learn what AI can and can't do, the scams aimed at them, and how to check an answer.
2. **Clinics for stuck civic problems (Solve).** Bring something stuck; leave with who can fix it, the public evidence, and a next step with a name on it.

How it runs:
- **Out of a library.** Designed for the Kansas City Public Library's Waldo Branch, using the CivicAI curriculum (NJ State Library + InnovateUS) as it's released. See [Partners](wiki/Partners.md).
- **Partnered for meetings.** Kansas City Documenters' verified notes are the meeting record. We never publish unreviewed AI summaries of meetings.
- **Participants are paid.** $30 per session, $20/hour for peer helpers, the Documenters rate.
- **Holds nothing about residents.** See the one-page [Threat Model](wiki/Threat-Model.md).
- **Measured by outcomes.** Problems resolved and time to resolution, AI-error spotting before and after, peer helpers retained at six months. See [Evaluation and Metrics](wiki/Evaluation-and-Metrics.md).

Infrastructure and governance (neighborhood memory, voting, local AI hardware) are on a separate page: [Later, if residents want it](wiki/Later-If-Residents-Want-It.md). The code for them lives in this repo but is not part of the current program.

---

## Current focus: 90-day pilot

The first pilot targets one neighborhood and three tracks:

- **Learn** - 3 sessions of practical AI literacy for residents, neighborhood leaders, nonprofits, and small businesses.
- **Solve** - 2 problem-solving clinics where participants bring stuck problems and leave with stakeholder maps and clear next steps.
- **Build** - 1 lightweight tool, scoped only after the Solve clinics surface a real need.

The candidate build on the table: a **Neighborhood Service Navigator and Action Tracker** - it helps residents turn a confusing local issue into plain-language next steps, relevant resources, source links, and a follow-up tracker reviewed by humans. Not a 311 replacement. Not legal advice. Not a sensitive-data system.

Success is measured by outcomes: problems actually resolved and how long they took, whether people can spot an AI error better after training, and paid peer helpers still involved at six months.

---

## Safety commitments

The default: we hold nothing about residents. See the [Threat Model](wiki/Threat-Model.md).

Hard limits:
- No resident dossiers
- No people scoring
- No predictive policing
- No protest monitoring
- No immigration-enforcement use
- No private social scraping
- No sensitive case management
- No automated adverse decisions about people
- No unreviewed AI summaries of public meetings

The design uses public and provenance-first records, human review, append-only audit events, and clear data-steward roles.

---

## Repo layout

```
neighborhoodos/
├── core/            # Node entry point, shared wiring
├── connectors/      # City data (KC Open Data, Legistar), social signals
├── ingest/          # Cron-ready ingest scripts (populate the DB)
├── identity/        # Civic identity, trust levels, federated voting
├── wedges/          # Pilot modules (swap as we learn)
│   └── home-maintenance/   # West Waldo home maintenance (archived prototype)
├── index.html, learn/, kit/, local/, assets/   # neighborhoodos.org (GitHub Pages)
├── docs/            # Full manuals: workshops, rubric, safety, stewardship
├── wiki/            # Program + technical wiki (start at wiki/Home.md)
└── package.json
```

---

## Principles

- **Practical before platform.** Ship the smallest useful thing for one real neighborhood. The framework gets written after v1 works, not before.
- **Neighborhoods over platforms.** Each neighborhood runs its own node. Data stays local unless residents decide otherwise.
- **Trust is the feature.** The tool is a reason to show up reliably. Good software with no trust is a failure.
- **Toothbrush test.** Does anyone use this daily? If not, reassess.
- **Safety by design.** Civic memory should protect communities, not expose them. Hard limits come first.

---

## Quick start (developer)

The software is optional and not part of the current program; see [Later, if residents want it](wiki/Later-If-Residents-Want-It.md).

```bash
git clone https://github.com/simonlpaige/neighborhoodos.git
cd neighborhoodos
npm install
npm test            # 46 checks: identity, voting, audit, federation, local AI helper
npm run config:example   # then edit node.config.json for your neighborhood
npm run sync        # pull public data into ./neighborhood-os.db
```

Full setup: [wiki/Developer-Setup.md](wiki/Developer-Setup.md).

Pilot module (early prototype, West Waldo home maintenance):
```bash
cd wedges/home-maintenance
npm install
node fetch-all.js   # pull KC Open Data
node ingest-all.js  # load into SQLite
node digest.js      # generate weekly digest
```

---

## Status

Program: in planning for Waldo, KCMO. Library, Documenters, and CivicAI partnerships are proposed, not yet agreed. Software: pre-alpha, breaking changes expected. Issues and PRs welcome.

Open for community use. Partner conversations: [simon@simonlpaige.com](mailto:simon@simonlpaige.com). Honest status: [Known Gaps and Roadmap](wiki/Known-Gaps-and-Roadmap.md).

---

## Relationship to Commonweave

[Commonweave](https://commonweave.earth) is a sibling project - a framework and directory for the broader "effortless economy" movement (co-ops, land trusts, mutual aid, commons-aligned orgs). NeighborhoodOS can optionally consume the Commonweave directory to answer "who's already working on this near me?" when a pilot calls for it. It is not required. The two projects run independently.

---

## License

MIT. See [`LICENSE`](./LICENSE).

## Mirrors

- GitHub: [simonlpaige/neighborhoodos](https://github.com/simonlpaige/neighborhoodos)
- Codeberg: [AlphaWorm/neighborhoodos](https://codeberg.org/AlphaWorm/neighborhoodos)
