# Data Sources

The data layer starts with sources that are public, linkable, and checkable. Full ingest mechanics are in the [Civic Data Ingest Guide](../docs/Civic-Data-Ingest-Guide.md).

## Kansas City Open Data (Socrata)

Base: `https://data.kcmo.org/resource/<id>.json`. Synced incrementally by `connectors/kc-open-data.js`.

| Key | Socrata ID | Dataset | Good for | Caution |
|---|---|---|---|---|
| `requests_311` | `7at3-sxhp` | 311 service requests | Infrastructure patterns, response times | Free-text fields can contain personal info; steward reviews |
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
