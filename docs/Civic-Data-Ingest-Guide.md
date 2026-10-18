# Operating manual: Public-data snapshots

This manual covers the published NeighborhoodOS dashboards. Their sources are official Kansas City datasets, and their outputs are dated, privacy-filtered JSON snapshots. Experimental connectors elsewhere in the repository are not the public-site pipeline.

## Refresh and publication

Run `npm run refresh:data` from the repository root. The scheduled GitHub Actions workflow runs this refresh and the organizer-calendar refresh daily, checks the result, builds the site, and publishes an explicit allowlist through GitHub Pages.

- `scripts/refresh-data.mjs` fetches official neighborhood polygons and 311 records.
- `scripts/civic-data.mjs` applies status, aggregation, and publication rules.
- `scripts/permits.mjs` fetches current issued building permits and matches parcels.
- `data/snapshots/` contains the public outputs.
- `scripts/stage-public-site.mjs` stages only the allowed public files.

Raw source rows are processed in memory. The public-site refresh does not create a SQLite database.

## Current source registry

| Source | DataKC identifier | Use |
| --- | --- | --- |
| 311 service requests | `d4px-6rwg` | Dated service-request summaries |
| Official neighborhoods | `vq6h-tqrf` | Named geographic boundaries |
| City Issued Permits | `w8jz-wjgn` | Issued residential and commercial building permits |
| City parcel polygons | `6g4y-sh3m` | Matching permits to neighborhoods |

The older permit feed `ntw8-aacc` stopped updating in May 2025. The parcel map was published in December 2023, so changed or new parcels can be missed. Keep the displayed coverage caveat even when permit records are fresh.

## Publication rules

Canceled and duplicate requests are separate from resolved requests. Closure medians use eligible resolved records only and cannot predict an open case's wait. Published locations are restricted to allowlisted infrastructure blocks; household complaints and free text are excluded.

Permit snapshots contain category counts and a limited recent list with permit numbers, dates, recorded status, and 100-block locations. They omit owners, contractors, descriptions, parcel identifiers, exact addresses, and coordinates. A permit does not establish that construction began or finished.

## Failure and review

A failed refresh must fail the publication job. Inspect the source and error before retrying; do not fill a failed feed with zeros. Check snapshot dates, expected fields, local links, and the rendered dashboard. Build and audit with `npm run check:web`.

Use [Data Sources](../wiki/Data-Sources.md) for full methodology and [Threat Model](../wiki/Threat-Model.md) for hosting and privacy limits.
