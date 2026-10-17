# Automatic building-permit dashboards — October 17, 2026

All three public neighborhood dashboards now check the current DataKC City Issued Permits feed during the existing nightly refresh. Linwood remains the program's starting area.

The first refresh matched 72 unique issued building permits in the Linwood/LAMP area (27 in 30 days), 34 in Lykins, and 16 in Hickman Mills. The citywide feed contains records through October 14 and was published October 15.

## Coverage and privacy

Only issued residential and commercial building permits count. Trade permits and applications without an issue date are excluded. Permits are not buildings, homes, completed projects, or proof of active authorization. Duplicate permit numbers count once per dashboard.

Current permit records have no coordinates. Parcel identifiers are joined to official city parcel polygons intersecting the dashboard's named city neighborhoods. The city's parcel source was last published December 30, 2023: new or changed parcels can be missed, and boundary-crossing parcels can appear in adjacent areas. That caveat is visible beside the counts.

Public snapshots contain totals, category counts, and up to 15 recent permit numbers, dates, statuses, categories, and 100-block locations. Owners, contractors, exact addresses, parcel identifiers, descriptions, coordinates, and raw source rows are excluded.

Current source: https://data.kcmo.org/d/w8jz-wjgn
Parcel source: https://data.kcmo.org/d/6g4y-sh3m

The retired ntw8-aacc source stopped updating in May 2025 and is not used. Refresh failures abort rather than publish misleading empty data. Dated snapshots remain visible so a failed refresh is distinguishable from current data.

## Verification

Live source refresh succeeded for all three areas. Unit checks cover parcel normalization, filtering, deduplication, privacy, and canceled statuses. Site generation, evidence packaging, and the 48-page audit passed. Focused browser checks cover all three dashboards at desktop and mobile sizes in both themes, accessibility, snapshot fields, and preserving the existing 311 print view.
