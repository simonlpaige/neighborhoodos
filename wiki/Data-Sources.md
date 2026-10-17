# Data Sources

The data layer starts with sources that are public, linkable, and checkable. Full ingest mechanics are in the [Civic Data Ingest Guide](../docs/Civic-Data-Ingest-Guide.md).

## Kansas City Open Data (Socrata)

Base: `https://data.kcmo.org/resource/<id>.json`. Synced incrementally by `connectors/kc-open-data.js`.

| Key | Socrata ID | Dataset | Good for | Caution |
|---|---|---|---|---|
| `requests_311` | `d4px-6rwg` | 311 service requests, 2021 to present | Infrastructure patterns, response times | The connector never pulls the free-text `additional_questions` field, which can hold names and phone numbers. The older `7at3-sxhp` dataset covers 2007 to March 2021 only |
| `permits` | `ntw8-aacc` | Building permits | Development and repair trends | |
| `violations` | `tezm-fh2e` | Property violations | Chronic code problems, especially commercial landlords | Never used to target individual homeowners |
| `dangerous_buildings` | `ax3m-jhxx` | Dangerous buildings list | Vacancy and blight | |
| `crime` | `gqy2-yvmn` | KCPD reported crime | Aggregate context only (e.g., lighting investments) | **Never** predictive, never block-level "hot spot" products, never shared with enforcement |
| `budget_expenditures` | `ygzn-3xmu` | City spending | Budget literacy | |
| `budget_revenue` | `rv2u-bdnp` | City revenue | Budget literacy | |
| `vendor_payments` | `39kh-2k2z` | Vendor payments | Follow the money | |
| `zoning` | `n88a-7et5` | Zoning districts | What can be built where | |
| `business_licenses` | `kkhs-93m4` | Business licenses | Local economic map | |

Dataset IDs were confirmed live in spring 2026. City portals change IDs occasionally; `ingest/probe.js` checks each one before syncing and records status in `connector_status`.

## Legislative records

- **Kansas City Council** via Legistar Web API: `https://webapi.legistar.com/v1/kansascity` (`connectors/legistar.js`). Matters, events, agendas, minutes. Used for the commitment tracker and meeting packets.
- **Jackson County Legislature**: `https://jacksonco.legistar.com/` (linked from the dashboard; not yet synced).

## Neighborhood knowledge (collected by people, not scraped)

- Resource map: associations, libraries, schools, churches, clinics, nonprofits, mutual aid, trusted businesses. Collect with permission from each organization.
- Meeting notes and public commitments from neighborhood meetings.
- The public problem log from Solve clinics.

Store organizations, not individuals. Every entry gets a source and a "last checked" date.

## Rules for any new source

1. Is it public, or collected with clear consent?
2. Can every record link back to where it came from?
3. Does it pass the Red-Light Test in the [Pilot Rubric](../docs/PILOT-RUBRIC.md)?
4. Does it have a named steward?
5. Is its freshness shown honestly wherever it's displayed?

If a feed breaks, show the link to the original source instead of stale numbers dressed as live.

## October 2026 public website snapshots

The public website uses official DataKC neighborhood polygons (`vq6h-tqrf`) and 311 records (`d4px-6rwg`). `data/neighborhoods.json` names exact polygon membership. Linwood / LAMP groups Key Coalition and four Ivanhoe areas; Lykins is not all of Northeast; Hickman Mills uses Hickman Mills and Hickman Mills South. Neighborhood coverage does not imply association consent or participation.

Snapshots cover requests opened in the trailing 365 days. The oldest-open metric excludes older cases. Canceled and duplicate statuses are distinct from resolved; status case is normalized. Closure medians use resolved records with a closure date and nonnegative duration, with local sample counts and a matched citywide window. Open cases are excluded; closed-only duration does not predict waiting time. The chart shows the last 12 calendar months with a partial final month. Unlocated city records cannot enter polygon counts.

Raw rows exist only in the refresh process memory. Published JSON contains aggregates and a short allowlist of public-infrastructure issues rounded to a 100-block. Household complaint locations, names, free text, coordinates, animal-service rows, and encampment rows never enter published output. No property layers or AI meeting summaries are published.

The city feed can lag; show both latest city record date and snapshot preparation date. If the snapshot is more than seven days old, the website warns and links to the official source. Failed refreshes do not overwrite snapshots with empty values. Source: https://data.kcmo.org/d/d4px-6rwg and https://data.kcmo.org/d/vq6h-tqrf.

## Current building-permit feed

Public dashboards automatically check City Issued Permits (`w8jz-wjgn`) nightly. The old CPD dataset (`ntw8-aacc`) stopped updating on May 9, 2025 and is historical. Only issued residential and commercial building permits in the trailing 365-day query window count; applications and separate electrical, plumbing, mechanical, zoning and other permits do not. Duplicate permit numbers count once per area.

The current permit feed has no geographic coordinates. Join `main_parcel_number` to `kivapin` in the city parcel polygons (`6g4y-sh3m`), retaining parcels intersecting the named official neighborhood polygons (`vq6h-tqrf`). A boundary-crossing parcel can appear in adjacent areas; counts must not be summed as a unique city total. The published parcel map was last updated December 30, 2023, so new or changed parcels can be missing. A zero match does not establish no construction.

Publish issue-date counts, residential/commercial categories, and at most 15 recent records with public permit number, recorded status and a 100-block. Never publish owners, contractors, descriptions, exact addresses, parcel identifiers or coordinates. Source record links select only permit number, issue date, type and status. Permit issuance does not prove that work started, finished, or remains authorized. Show the permit source date, publication date, check date, and parcel-map date separately. A failed source or geometry query prevents publication of an empty replacement.

Official sources: https://data.kcmo.org/d/w8jz-wjgn and https://data.kcmo.org/d/6g4y-sh3m.
