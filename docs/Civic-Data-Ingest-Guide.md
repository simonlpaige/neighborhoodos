# Neighborhood Memory: Civic Data Ingest Guide

This guide is the technical operating manual for setting up, running, and auditing our public-record data ingestion pipelines. It covers our live municipal Socrata API endpoints (KCMO Open Data) and explains how our connectors sync this data incrementally into SQLite.

---

## 🏛 The Municipal Data Source

We pull our civic data from **Kansas City Open Data (KCMO Open Data)**, which is hosted on Socrata. The base API endpoint is:
`https://data.kcmo.org/resource`

To prevent our local pipelines from being rate-limited by Socrata, you can obtain a free App Token from the Socrata developer portal and supply it as the `KC_OPEN_DATA_TOKEN` environment variable.

---

## 📁 The Dataset Registry (KCMO Endpoints)

We track ten canonical public datasets. Each has a specific resource ID and date-tracking field used for incremental synchronization:

| Dataset Key | Socrata ID | Name | Date Field | Purpose |
|-------------|------------|------|------------|---------|
| `requests_311` | `d4px-6rwg` | 311 Service Requests (2021 to present) | `open_date_time` | Spotting infrastructure neglect |
| `permits` | `ntw8-aacc` | Building Permits | `issue_date` | Tracking development trends |
| `crime` | `gqy2-yvmn` | KCPD Reported Crime | `reported_date` | Analyzing physical neighborhood safety |
| `violations` | `tezm-fh2e` | Property Violations | `violation_entry_date` | Mapping housing code neglect |
| `dangerous_buildings` | `ax3m-jhxx` | Dangerous Buildings | *Full sync* | Auditing abandoned properties |
| `budget_expenditures` | `ygzn-3xmu` | Budget Expenditures | `fiscal_year` | Reviewing city department spending |
| `budget_revenue` | `rv2u-bdnp` | Budget Revenue | `fiscal_year` | Auditing city revenues |
| `vendor_payments` | `39kh-2k2z` | Vendor Payments | `check_date` | Tracking where taxpayer money flows |
| `zoning` | `n88a-7et5` | Zoning Districts | *Static sync* | Understanding development limits |
| `business_licenses` | `kkhs-93m4` | Business Licenses | *Full sync* | Mapping local economic assets |

---

## 🛠 Incremental Ingest & Cursor Tracking

Our ingestion pipeline runs via `ingest/sync.js`. Rather than downloading several gigabytes of historical data on every run, our connector implements **incremental syncing using a cursor**:

1.  **Retrieve Cursor**: The connector queries our SQLite database's `sync_cursors` table to find the latest timestamp we have successfully ingested for that dataset.
2.  **Fetch New Records**: It queries the Socrata API, ordering by the date field, and filters for records with a date *greater than* our cursor.
3.  **Page Through Results**: It fetches records in pages of 1,000 until the Socrata API returns an empty array.
4.  **Save to SQLite**: It writes the records using SQL `INSERT OR REPLACE` transactions wrapped in the `core/db.js` secure driver.
5.  **Update Cursor**: Upon successful completion, it updates the dataset's entry in `sync_cursors` with the date of the latest record written.

---

## 💻 Running a Sync (The Developer CLI)

To run a manual sync of all datasets or a single dataset, use the root package scripts:

```bash
# Sync all datasets incrementally
npm run sync

# Check the sync status and cursor dates of your local DB
npm run sync:status
```

---

## 🚨 Auditing and Quality Controls

Because city data portals are notoriously noisy and unstable, your ingestion pipelines must enforce three data-cleaning rules:

### 1. Stripping Defunct Tracking Parameters
Municipal data portals often contain UTM-laden tracking parameters or broken internal URLs. Our scraper strip-parameters function must clean every URL before writing it to our SQLite tables.

### 2. Geocoding Failures and Fallbacks
KCMO Open Data geocodes (lat/lon coordinates) are often missing or malformed for old records. 
- **Rule**: If a record has a street address but missing coordinates, write the street address to `street_address` and flag `lat` and `lon` as `NULL`. 
- **Safety**: Do not write unverified coordinates. Never attempt to use a third-party, commercial geocoding API that logs or tracks searches.

### 3. Socrata Outages and Retries
If the Socrata API returns an HTTP 500 or 503 error, our connector will retry the fetch up to 3 times with exponential backoff (2s, 4s, 8s). If the sync still fails, it aborts the current dataset run, preserves the previous working cursor, and logs an error to `system_safety_audit`. It never writes partial or corrupted records to the database.
