# Review response and frontend polish — October 18, 2026

Reviewed the shared Gemini conversation, “NeighborhoodOS Digital Platform Optimization”:
https://share.gemini.google/kwhFFFkc74OS

The review was treated as a set of hypotheses and recommendations. Current source, generated pages, official agency information, and browser behavior determined the changes.

## Changes shipped

- Resident navigation now names four actions, with a separate menu for program hosts and funders.
- The homepage leads with the result a neighbor can work toward, retaining the established workshop palette, local fonts, and example brief.
- “What the work is for” states resident agency, visible authority, participation, privacy limits, evidence, and measurable follow-through.
- A source-linked “Who fixes what in Kansas City?” guide distinguishes city service requests, rental inspection, water, permits/zoning, county assessment, and neighborhood organizing.
- Dashboard categories open a brief with dated public context. Only fixed public identifiers travel in URL fragments. Typed answers are never inserted into URLs, storage, or translation copies. Existing answers are protected from overwrite.
- Briefs link to relevant resource categories and ask for a named action and check-back date.
- Sessions offer an honest request-to-host route and a lesson to use now; they do not imply scheduling, notification enrollment, or funded attendance.
- Results display generated readiness counts separately from unclaimed cohort outcomes.
- Guide summaries use Markdown parsing, links preserve anchors, four revised manuals join the searchable guide, and an audit detects unrendered links.
- The README leads with the current static-site architecture. SQLite ignore patterns are added as a safeguard.

## Recommendations adjusted or already satisfied

The canonical URLs, sitemap, robots reference, six translation choices, and Pages artifact allowlist already existed. No SQLite files were tracked at the checked revision; no file or history removal was necessary.

The guide-summary bug came from stripping Markdown punctuation in summaries, rather than a universal failure of Markdown rendering. A proper text extraction step fixes the cause.

The review's proposed long-open versus resolved bars omit other requests. The new bar instead shows open, resolved, and canceled/duplicate categories from the same dated request set. Long-open requests remain explicitly a subset of open requests.

The four source manuals contained stale privacy guarantees, prototype assumptions, and old permit-source guidance. They were revised before publication. Other source documents are not automatically promoted into public guidance.

Moving every generated file to a new build tree and replacing Python ZIP packaging were deferred: the current explicit staging and deployment boundaries already work. No Git history rewrite or unsolicited GitHub issues were created.

## Verification

- Web unit checks cover status rules, publication privacy, language handling, guide summaries, Markdown routes, and anchors.
- Static audit covers all 54 indexable pages and local link targets.
- Browser checks cover the core lesson, brief, resources, guide search, menus, redirects, narrow layouts, and local-only input.
- Light/dark audits include expanded translation menus.
- Both the Linwood 311 print snapshot and example brief remain one page.

These checks establish implemented behavior, not community outcomes. Use voluntary facilitator and resident feedback, followed by reviewed outcomes, to assess real effectiveness.

## Official routing sources

- https://www.kcmo.gov/city-hall/311
- https://www.kcmo.gov/city-hall/departments/health/environmental-health-services/tenant-information-healthy-homes-rental-inspection-program
- https://www.kcwater.us/about-us/contact-us/
- https://www.kcmo.gov/city-hall/departments/city-planning-development
- https://www.jacksongov.org/Government/Departments/Assessment

Source pages checked October 18, 2026; current instructions remain with the responsible office.

Final local checks: 15 web unit checks, 54-page static audit, 65 browser page/viewport checks, 28 resident-flow layout checks, and 120 appearance checks passed. Automated accessibility audits reported zero remaining violations. Both print exports were verified as one page. The evidence ZIP contains 25 verified files.
