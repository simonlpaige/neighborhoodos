# Contributing

Start with the [program guide](https://neighborhoodos.org/guide/) and [safety doctrine](wiki/Safety-Doctrine.md). The public website is static. Experimental identity/governance code is not deployed with it.

Use Node 22+ and Python 3. Run `npm ci`. Edit templates in `scripts/pages.mjs`, styles in `assets/workshop.css`, guide text in `wiki/`, or directory records in `data/resources.json`. Retained interactive fragments are in `content/`. Do not hand-edit generated HTML.

Run `npm run build`, `npm run test:web`, and `npm run audit:web`. Serve localhost:8765 and use `npm run check:browser` for browser tests. Review desktop, mobile, keyboard and print behavior.

Resources need an organization, public source, last-checked date, service category, area and steward role. A reachable page does not establish a service or partnership. Add neighborhood coverage through `data/neighborhoods.json`, with exact official polygon names; data coverage does not imply participation. Raw city rows must never be committed.

Clinic playbooks, public problem logs and data collection changes need data-steward review. Keep program lead and steward separate. No unreviewed AI meeting summaries. Use SECURITY.md for sensitive concerns.
