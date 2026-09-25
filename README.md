# NeighborhoodOS

**Helping communities build practical AI capacity, share context, and solve real problems together.**

Live site: [neighborhoodos.org](https://neighborhoodos.org) · **Wiki: [start here](wiki/Home.md)** · Free lesson: [neighborhoodos.org/learn](https://neighborhoodos.org/learn/)

> **Open for community use.** NeighborhoodOS has been handed off so partner organizations can run it without the original author. The [wiki](wiki/Home.md) contains everything needed to run a program: program design, session plans, roles, budget, safety doctrine, data sources, and developer setup. See [Handoff and Licensing](wiki/Handoff-and-Licensing.md).

---

## What this is

NeighborhoodOS is a civic AI project with three practical pieces:

1. **Education, training, and problem solving** - residents learn what AI can and cannot do, bring real local problems to structured clinics, and help build simple community-benefit tools.
2. **Public data, federated governance, and neighborhood memory** - shared civic memory built from 311, city, county, and state records, plus local resources, assets, and meeting notes. Built to guide decisions, surface problems and solutions, and protect communities from institutional forgetting.
3. **Local AI infrastructure and shared tools** - community-governed access to AI capacity. Trusted access points, shared tools, clear usage rules, and local stewardship.

The entry point is always **Learn, Solve, Build** - not the platform.

---

## Current focus: 90-day pilot

The first pilot targets one neighborhood and three tracks:

- **Learn** - 3 sessions of practical AI literacy for residents, neighborhood leaders, nonprofits, and small businesses.
- **Solve** - 2 problem-solving clinics where participants bring stuck problems and leave with stakeholder maps and clear next steps.
- **Build** - 1 lightweight tool, scoped only after the Solve clinics surface a real need.

The candidate build on the table: a **Neighborhood Service Navigator and Action Tracker** - it helps residents turn a confusing local issue into plain-language next steps, relevant resources, source links, and a follow-up tracker reviewed by humans. Not a 311 replacement. Not legal advice. Not a sensitive-data system.

Success at day 90: 3 Learn sessions, 2 Solve clinics, 10-20 real problems captured, 3-5 moved to next actions, 1 Build candidate scoped or set aside with a clear reason, and enough evidence to decide what comes next.

---

## Safety commitments

The public data and neighborhood memory layer is designed to be bad at surveillance on purpose.

Hard limits:
- No resident dossiers
- No people scoring
- No predictive policing
- No protest monitoring
- No immigration-enforcement use
- No private social scraping
- No sensitive case management
- No automated adverse decisions about people

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
│   └── home-maintenance/   # West Waldo home maintenance (early prototype)
├── index.html, learn/, local/, pilot/   # neighborhoodos.org (GitHub Pages)
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

```bash
git clone https://github.com/simonlpaige/neighborhoodos.git
cd neighborhoodos
npm install
npm test            # 40 checks: identity, voting, audit, federation
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

Pre-alpha. One active pilot in development (West Waldo, KCMO). Breaking changes are expected. Issues and PRs welcome.

Handed off for community use; first partner: [KC Digital Drive](https://kcdigitaldrive.org). Honest status: [Known Gaps and Roadmap](wiki/Known-Gaps-and-Roadmap.md).

---

## Relationship to Commonweave

[Commonweave](https://commonweave.earth) is a sibling project - a framework and directory for the broader "effortless economy" movement (co-ops, land trusts, mutual aid, commons-aligned orgs). NeighborhoodOS can optionally consume the Commonweave directory to answer "who's already working on this near me?" when a pilot calls for it. It is not required. The two projects run independently.

---

## License

MIT. See [`LICENSE`](./LICENSE).

## Mirrors

- GitHub: [simonlpaige/neighborhoodos](https://github.com/simonlpaige/neighborhoodos)
- Codeberg: [AlphaWorm/neighborhoodos](https://codeberg.org/AlphaWorm/neighborhoodos)
