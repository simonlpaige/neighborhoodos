# NeighborhoodOS

**An operating system for neighborhoods that want to solve their own problems.**

Pick one shared pain. Build a working tool around it. Use the tool to strengthen trust, capacity, and self-governance. Rotate to the next pain when the first one is handled well.

Live site: [neighborhoodos.org](https://neighborhoodos.org)

---

## The wedge approach

Most civic software tries to do everything for everyone. It ends up doing nothing for anyone.

NeighborhoodOS works the other way. We start with **one sharp, specific pain** in **one real neighborhood** and ship a working tool for it in weeks, not quarters. When it earns trust, we keep it running and pick the next pain.

The pain we pick has to pass four tests:

1. **Concrete.** You can describe it in one sentence at a kitchen table.
2. **Costly.** People are losing money, time, or dignity to it right now.
3. **Local.** The solution works at the block level without waiting on policy.
4. **Swappable.** If we build the wrong thing, we can stop and pick something else without tearing out the platform.

The platform in this repo stays the same across wedges. The wedge modules (`wedges/*`) are the things we swap.

---

## Current wedge: Home maintenance (West Waldo, KCMO)

Pilot target: **homeowners in West Waldo, Kansas City, Missouri.**

Out of scope: rental properties, landlord coordination, commercial property.

Why this first: older neighborhoods consistently tell us the same story. An aging homeowner gets a $200 repair they can't find a trustworthy contractor for, postpones it, and it turns into an $8,000 disaster. Or three neighbors on the same block hire three different people for the same fence stain job at three different price points, with two bad outcomes. A vetted-neighbor handyperson network, a shared tool library, and a "I'll come look at it for free" first-pass diagnostic can save real money and print real trust inside 90 days.

See [`wedges/home-maintenance/`](./wedges/home-maintenance/) for pilot code and docs.

---

## Repo layout

```
neighborhoodos/
├── core/            # Node entry point, shared wiring
├── connectors/      # City data (KC Open Data, Legistar), social signals
├── ingest/          # Cron-ready ingest scripts (populate the DB)
├── identity/        # Civic identity, trust levels, federated voting
├── wedges/          # Wedge implementations (swap me as we learn)
│   └── home-maintenance/   # Current pilot: West Waldo home maintenance
├── site/            # neighborhoodos.org frontend
├── docs/            # Architecture + wedge playbook
└── package.json
```

---

## Principles

- **Proof before framework.** Ship the ugliest v1 that solves a real problem. The framework is what gets written AFTER the v1 works, not before.
- **Neighborhoods over platforms.** Each neighborhood runs its own node. No central server. Data stays local unless residents vote to federate it.
- **Trust is the feature.** The tool is a pretext for showing up reliably. If the software is good and nobody trusts anybody, we failed.
- **Toothbrush test.** Does anyone use this daily? If not, reassess.
- **Swap, don't scale.** A wedge that worked in one neighborhood isn't automatically right for another. Every new node starts with its own listening phase.

---

## Quick start (developer)

```bash
git clone https://github.com/simonlpaige/neighborhoodos.git
cd neighborhoodos
npm install

# Current wedge (West Waldo home maintenance pilot):
cd wedges/home-maintenance
npm install
node fetch-all.js   # pull KC Open Data
node ingest-all.js  # load into SQLite
node digest.js      # generate weekly digest
```

See [`wedges/home-maintenance/LEGACY-README.md`](./wedges/home-maintenance/LEGACY-README.md) for full commands.

---

## Status

Pre-alpha. One active pilot node (West Waldo). No production dependencies on this code outside that pilot. Breaking changes are still expected weekly. Issues and PRs welcome but don't expect backward compatibility yet.

---

## Relationship to Commonweave

[Commonweave](https://commonweave.earth) is a sibling project — a framework and directory for the broader "effortless economy" movement (co-ops, land trusts, mutual aid, commons-aligned orgs). NeighborhoodOS can optionally consume the Commonweave directory to answer "who's already working on this near me?" when a wedge calls for it. It is not required. The two projects run independently.

---

## License

MIT. See [`LICENSE`](./LICENSE).

## Mirrors

- GitHub: [simonlpaige/neighborhoodos](https://github.com/simonlpaige/neighborhoodos)
- Codeberg: [AlphaWorm/neighborhoodos](https://codeberg.org/AlphaWorm/neighborhoodos)
