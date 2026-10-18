# NeighborhoodOS Design Guide

## Active design: October 2026 Linwood workshop refresh

Simon explicitly requested and approved a fresh visual direction in October 2026. This section supersedes the earlier palette, fonts, components, and Waldo-specific language below, which remain only as historical context.

- Identity: a useful Linwood neighborhood workshop. The completed one-page problem brief is the signature visual; every page should make a practical next step clear.
- Palette: white #FFFFFF, midnight #17324D, workwear blue #2457C5, light blue #EAF2FA, notice yellow #F4CE54, slate #465568. Yellow carries dark text and is never low-contrast body text.
- Type: locally served Barlow Condensed semibold headings; Atkinson Hyperlegible regular/bold body. Upright headlines, sentence-case navigation, no decorative monospace labels.
- Layout: left-aligned content, a 1240px maximum container, useful semantic groups, quiet boundaries. Homepage hero pairs the practical promise with a clearly labeled example brief. Stack on mobile; no horizontal page overflow at 320px.
- Access: WCAG 2.2 AA target, visible keyboard focus, 44px project touch targets, reduced-motion support, table alternatives, focusable table scroll regions, print layouts, and local-only resident input. Automated checks supplement manual review.
- Program: KC Digital Drive adoption is confirmed. Simon L. Paige remains founder, site administrator, and advisor. Program contact uses KCDD's official contact page until a shared inbox is supplied. LAMP/DSSC address is 1801 Linwood Blvd, Kansas City, MO 64109.
- Status: no unconfirmed clinic dates, paid-session promises, partner commitments, grants, or outcomes. Resource listings and public-data coverage do not establish participation.
- Data: official named polygons, dated snapshots, canceled distinct from resolved, no household complaint locations or free text. Print outputs are a supported first-class task.
- Sources: `scripts/pages.mjs`, `scripts/build-site.mjs`, `assets/workshop.css`, `content/`, `wiki/`, and `data/`. Root HTML is generated. The publication workflow stages an allowlist in `.public-site/`; source fragments and experimental backend modules are excluded.

Before release, run the static audit and relevant tests, inspect desktop and mobile, exercise the lesson and brief, and verify live rendering after deployment.

October 2026 appearance and language controls: follow `prefers-color-scheme` until a visitor selects light or dark. A compact sun/moon switch and an Auto reset sit beside the Translate menu in the top bar. Store only the functional theme preference locally; print stays light. Use semantic color tokens in `workshop.css` with light/dark values in `appearance.css`. Test both palettes and the expanded language menu for contrast and keyboard access.

The Translate menu offers Spanish, Chinese (Simplified), Vietnamese, Arabic, French, and Swahili, based on KCMO language-access priorities; do not claim a precise current individual-language ranking. Links open Google Translate only on request, using non-indexed public reading copies with no editable forms or scripts. Original page input must never appear in a translation URL or copy. The native Spanish lesson remains separate.

## October 18 resident-flow polish

The front door leads with a neighborhood question and a useful next step. Keep the completed brief as the signature visual. Four primary resident actions sit beside a separate host/funder menu. Explain agency and privacy affirmatively while retaining the specific safety rules and provider limits. Connect dashboards to private brief starting points using fixed public context identifiers in URL fragments; never place resident answers in URLs, storage, or translation copies. Show open/resolved/canceled shares with a common denominator. Readiness counts are not program outcomes.

## Historical design reference (superseded)

Canonical source of truth for `neighborhoodos.org` visual and customer-facing work.

This guide captures the Claude Design direction already present in the live site: civic, local, editorial, warm, and useful. Use this before touching any NeighborhoodOS frontend, dashboard, packet, deck, public doc, case study, or visual artifact.

## Core feel

NeighborhoodOS should feel like a neighborhood field guide, a civic notebook, and a kitchen-table operating manual. It should not feel like generic SaaS, govtech sludge, AI startup vapor, glossy civic futurism, or fake community clip-art.

The software is not the hero. Neighbor action is the hero.

## Design principles

1. Public-source honest. If data is live, say so. If a feed fails or is not parsed yet, link to the real source.
2. Editorial before dashboard. Make pages readable first, interactive second.
3. Warm civic paper. Backgrounds should feel like paper, not cold app chrome.
4. Local specificity. Prefer Linwood, KCMO, Jackson County, 311, council, planning, budgets, home repair, block-level language.
5. No mythology pileups. NeighborhoodOS, education/training/problem-solving, public data/memory, local AI infrastructure/resources, WaldoNet, Commonweave, and KCDD need clear roles.
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

- NeighborhoodOS = free, practical AI help for Linwood neighbors, plus clinics for stuck civic problems. Use this one-liner verbatim; don't invent new taglines.
- Learn / Solve / Build = the program. Learn and Solve are the public front door.
- Neighborhood memory, governance tools, local AI hardware = "Later, if residents want it." Never lead with these on public pages.
- Meetings = link to Kansas City Documenters notes or official minutes. Never show unreviewed AI summaries of meetings.
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

- Style guide: `DESIGN.md` (repo root)
- Live site source: the repo root (`index.html`, `learn/`, `kit/`, `local/`, `pilot/`, `launch.html`, shared styles in `assets/nos.css`), served by GitHub Pages from `main`
- Live URL: `https://neighborhoodos.org`
- GitHub: `https://github.com/simonlpaige/neighborhoodos`
- The old `site/` folder was a stale duplicate and has been removed.
