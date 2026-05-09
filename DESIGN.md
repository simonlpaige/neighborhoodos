# NeighborhoodOS Design Guide

Canonical source of truth for `neighborhoodos.org` visual and customer-facing work.

This guide captures the Claude Design direction already present in the live site: civic, local, editorial, warm, and useful. Use this before touching any NeighborhoodOS frontend, dashboard, packet, deck, public doc, case study, or visual artifact.

## Core feel

NeighborhoodOS should feel like a neighborhood field guide, a civic notebook, and a kitchen-table operating manual. It should not feel like generic SaaS, govtech sludge, AI startup vapor, glossy civic futurism, or fake community clip-art.

The software is not the hero. Neighbor action is the hero.

## Design principles

1. Public-source honest. If data is live, say so. If a feed fails or is not parsed yet, link to the real source.
2. Editorial before dashboard. Make pages readable first, interactive second.
3. Warm civic paper. Backgrounds should feel like paper, not cold app chrome.
4. Local specificity. Prefer Waldo, KCMO, Jackson County, 311, council, planning, budgets, home repair, block-level language.
5. No mythology pileups. NeighborhoodOS, Workshop, Loom, Grove, WaldoNet, Commonweave, and KCDD need clear roles.
6. Small useful wedge. Design around one resident action at a time.
7. Accessibility is part of the aesthetic: contrast, semantic HTML, visible focus, readable type, keyboard-safe controls.

## Visual system

Use the existing live palette unless Simon explicitly requests a redesign.

- paper: #F5EFE6
- paper-2: #EDE5D6
- paper-3: #E2D8C3
- ink: #1F1A17
- ink-2: #3A332D
- ink-3: #7A6F66
- terracotta: #C2553A
- terracotta-deep: #8E3A26
- ochre: #D9A441
- moss: #5C7A4E
- dusk: #3F4A6B
- brick: #8B2E1F

Use paper as the base, ink for text, terracotta for emphasis and action, dusk for links, and moss/ochre/brick sparingly for civic status.

Avoid bright startup blue, neon green, pure-white app panels, heavy gradients, and dark-mode civic bunker vibes.

## Type

Use the live font system:

- Display: Fraunces, Georgia, serif
- Body: Inter Tight, system-ui, sans-serif
- Mono: JetBrains Mono, ui-monospace, monospace

Display headings use Fraunces, often italic. Body copy uses Inter Tight. Labels, nav, chips, metadata, counters, filters, and technical notes use JetBrains Mono. Do not swap in generic Montserrat/Poppins/SF-Pro SaaS polish.

## Shape and layout

- Editorial pages max around 920px.
- Dashboard pages max around 1120px.
- Use generous section padding: 64px to 96px desktop, tighter mobile.
- Cards use subtle borders, 12px radius, paper backgrounds.
- Rules are thin, visible, and document-like.
- Navigation is sticky, quiet, and mono-labeled.
- Use section-head patterns: small numbered mono label plus large Fraunces heading.

## Components

Reuse these existing patterns before inventing new components:

- `site-nav` with `neighborhoodOS` wordmark
- `eyebrow` labels
- italic Fraunces `h1` and `h2`
- `section-head` with number label
- `card` for civic explanations and source panels
- `callout` for strong editorial statements
- `marginalia` for aside notes
- `chip`, `pill`, `tag` for state and metadata
- `filter` buttons for dashboard filtering
- `btn` for resident actions
- source lists with honest live/source/warn tags

## Copy rules

Write like a neighbor explaining the thing at a kitchen table.

Good:

- “The software does not swing the hammer. People swing the hammer.”
- “If a thing cannot load live yet, this page sends you to the real public source.”
- “Pick one sharp problem on your block.”

Bad:

- “AI-powered civic transformation platform.”
- “Seamlessly empowers stakeholders through data-driven insights.”
- “Revolutionizing neighborhood engagement.”

Use concrete nouns. Use short verbs. Explain what a resident can do next.

## Dashboard rules

For dashboards and local-node pages:

- show freshness and source status near the top
- label live data honestly
- provide source links even when parsing is incomplete
- keep filters real, not decorative
- avoid pretending city/county data is cleaner than it is
- include next actions, not just charts

## Relationship language

- NeighborhoodOS = umbrella civic AI ecosystem and public site.
- The Workshop = public front door for Learn / Solve / Build and resident-first AI literacy.
- The Loom = civic evidence and memory layer with provenance and safety boundaries.
- The Grove / Waldo Grove = local stewardship and place-based pilot frame.
- WaldoNet = legacy/prototype language. Use only when historical context requires it.
- Commonweave = sibling project, not merged into NeighborhoodOS.

Do not collapse these into one vague mega-platform.

## Safety boundaries in design

Never design toward people databases, resident dossiers, predictive policing, protest monitoring, private social scraping, sensitive case management, or outbound LLM calls for civic decisions.

If a UI might imply any of that, rewrite it.

## Implementation checklist

Before changing NeighborhoodOS customer-facing work:

1. Read this file.
2. Inspect the current page/rendering locally or live.
3. Preserve the color/type/component system unless redesign is explicit.
4. Make the smallest useful change.
5. Run the web audit before deploy.
6. Verify live desktop and mobile screenshots after deploy.
7. Report full proof paths.

## Canonical files

- Style guide: `C:\Users\simon\code\neighborhoodos\DESIGN.md`
- Repo: `C:\Users\simon\code\neighborhoodos`
- Live site source: `C:\Users\simon\code\neighborhoodos\site\`
- Live URL: `https://neighborhoodos.org`
- GitHub: `https://github.com/simonlpaige/neighborhoodos`
