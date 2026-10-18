# NeighborhoodOS

**Free, practical AI help for Linwood neighbors, plus clinics for stuck civic problems.**

[Use the website](https://neighborhoodos.org/) · [Make a brief](https://neighborhoodos.org/brief/) · [Who fixes what?](https://neighborhoodos.org/who-fixes-what/) · [Program guide](https://neighborhoodos.org/guide/) · [Contact KC Digital Drive](https://www.kcdigitaldrive.org/contact/)

KC Digital Drive owns the program. Simon L. Paige created NeighborhoodOS and remains site administrator and advisor. Linwood is the starting area; other neighborhoods can adapt the materials. No repository or domain transfer is implied.

## What a neighbor can do today

- Practice checking an AI answer with the free lesson.
- Find the office responsible for a local issue.
- Make a private, printable brief with evidence, a next action, and a check-back date.
- Read dated 311 and building-permit snapshots or find local help.

The public website has no accounts, analytics, or resident database. Brief answers remain in the tab until the user copies or prints them. Hosting providers can receive ordinary web-access information. Optional external translation and contact services follow their own policies. See the [Threat Model](wiki/Threat-Model.md).

## Program and philosophy

Residents choose the question. Facilitators help identify authority, check sources, and make follow-through practical. A completed brief is an output; a documented response or improvement is an outcome. Public-data totals do not establish program impact.

KCDD adoption is confirmed. Clinic dates, facilitators, access arrangements, and stipend funding must be confirmed before sessions are announced. The planning budget includes participant and peer-helper pay; it is not a promise of funded attendance. See [sessions](https://neighborhoodos.org/sessions/), [principles](wiki/Principles.md), [evaluation](wiki/Evaluation-and-Metrics.md), and the [Safety Doctrine](wiki/Safety-Doctrine.md).

## Website quick start

Use Node 22 and Python 3.12 (for the evidence ZIP), matching CI.

```sh
npm ci
npm run check:web
python -m http.server 8765
```

Open http://localhost:8765. Run browser checks in a second terminal:

```sh
npx playwright install chromium
npm run check:browser
npm run check:appearance
npm run check:resident
```

`check:web` builds the site, runs web unit checks, and audits generated pages. Browser checks require the local server above. They test interactions, accessibility, responsive layouts, and themes. Automated checks complement manual review.

To refresh public sources:

```sh
npm run refresh:data
node scripts/refresh-calendar.mjs
npm run check:web
```

Refreshes contact official public APIs. The normal build uses checked-in snapshots. Failed refreshes must not publish empty replacements.

## Source and generated files

| Location | Purpose |
| --- | --- |
| `scripts/pages.mjs`, `scripts/build-site.mjs` | Page content and site generator |
| `scripts/resident-tools.mjs`, `scripts/guide-render.mjs` | Resident flows, routing, and handbook rendering |
| `content/` | Source fragments for the lesson, brief, and print kit |
| `wiki/` | Program, safety, and operating guidance |
| Selected `docs/` manuals | Reviewed manuals published in the same guide |
| `assets/` | Local fonts, styles, and browser code |
| `data/snapshots/` | Public, filtered 311 and permit data |
| Root HTML and route folders | Generated output; edit source and rebuild |
| `tests/`, `scripts/*check*.mjs` | Unit and browser validation |
| `.public-site/` | Ignored deployment staging area containing only the public allowlist |

GitHub Actions refreshes snapshots and the organizer calendar daily, runs checks, builds, stages, and deploys a Pages artifact. Source fragments, local databases, test artifacts, and experimental backends are excluded from hosting. Generated HTML remains committed for review; do not edit it by hand.

## Experimental and archived software

`core/`, `connectors/`, `ingest/`, and `identity/` contain experimental Node/SQLite, local AI, and federation work. These modules are not deployed on neighborhoodos.org and are not required by residents or facilitators. Their checks run with `npm test`. See [Developer Setup](wiki/Developer-Setup.md) and [Later, if residents want it](wiki/Later-If-Residents-Want-It.md) before using them.

`wedges/home-maintenance/` is an archived West Waldo prototype. The current public program starts in Linwood.

## Contributing

Begin with a specific resident task or a documented source correction. Follow [DESIGN.md](DESIGN.md), preserve privacy boundaries, and keep sources and coverage limits beside public claims. Check the [roadmap](wiki/Known-Gaps-and-Roadmap.md) for current scope.

[Commonweave](https://commonweave.earth) is an independent sibling project, not a required NeighborhoodOS service.

## License and source

MIT; see [LICENSE](LICENSE). [GitHub](https://github.com/simonlpaige/neighborhoodos) is the release source. [Codeberg mirror](https://codeberg.org/AlphaWorm/neighborhoodos).
