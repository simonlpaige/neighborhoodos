# NeighborhoodOS — West Waldo Pilot

Civic intelligence tooling for West Waldo, Kansas City. Tracks 311 service requests, city commitment follow-through, and lets residents ask plain-English questions about their neighborhood.

Part of the [WaldoNet](https://waldonet.simonlpaige.com) civic AI initiative.

---

## Quick Start

```bash
cd neighborhood-os
npm install

# 1a. Pull 311 data from KC Open Data
node fetch-311.js

# 1b. Pull ALL data sources (permits, crime, violations, budget, vendors)
node fetch-all.js

# 2a. Load 311 into SQLite
node ingest.js

# 2b. Load all other sources into SQLite
node ingest-all.js

# 3. Generate weekly digest
node digest.js

# 4. Ask a question (requires Ollama running)
node ask.js "What are the most common 311 complaints in Waldo?"
```

---

## Commands

### `node fetch-all.js`
Fetches all KC Open Data sources for West Waldo and saves raw JSON to `data/`:
- `data/permits-raw.json` — Building permits (ntw8-aacc)
- `data/crime-raw.json` — Crime reports (gqy2-yvmn)
- `data/violations-raw.json` — Property violations (tezm-fh2e)
- `data/dangerous-buildings-raw.json` — Dangerous buildings (ax3m-jhxx)
- `data/budget-expenditures-raw.json` — FY budget expenditures (ygzn-3xmu)
- `data/budget-revenue-raw.json` — FY budget revenue (rv2u-bdnp)
- `data/vendor-payments-raw.json` — Vendor payments (39kh-2k2z)

Uses a graceful fallback chain per dataset: geo filter → neighborhood name filter → unfiltered.
One failing source does not stop others.

---

### `node ingest-all.js`
Reads all raw JSON files from `data/` and upserts into their respective DB tables.
Reports new / updated / skipped per table.

---

### `node fetch-311.js`
Pulls 311 service requests from KC Open Data filtered to West Waldo's bounding box (lat 38.97–38.99, lon -94.60 to -94.57). Saves raw JSON to `data/311-raw.json`.

Tries two datasets:
- `7at3-sxhp` — Historical 311 (2007–March 2021), geocoded
- `g7yw-jg39` — Live 311 feed

---

### `node ingest.js`
Reads `data/311-raw.json` and upserts into SQLite (`data/neighborhood-os.db`).
Reports: new, updated, total records.

---

### `node digest.js`
Generates a weekly digest with:
- New 311 requests this week (by category)
- Overdue open requests (>30 days, by type)
- Commitments due for follow-up in the next 14 days
- Quick stats

Output: stdout + `digests/YYYY-MM-DD.md`

---

### `node ask.js "<question>"`
Ask a plain-English question about the neighborhood.
Uses local Ollama (gemma4:26b or fallback).

Examples:
```bash
node ask.js "What are the most common complaints?"
node ask.js "Which streets have the most unresolved issues?"
node ask.js "Are there overdue commitments from city officials?"
node ask.js "How long have open requests been waiting on average?"
```

**Requires Ollama running locally.** If Ollama is down, the script prints the context it would have used so you can paste it into any LLM manually.

---

### `node commitments-cli.js`

Track commitments made by city officials at meetings.

```bash
# Add a new commitment
node commitments-cli.js add

# List open commitments (flags overdue)
node commitments-cli.js list

# List all commitments including closed
node commitments-cli.js all

# Mark a commitment resolved
node commitments-cli.js close 3
```

---

## Data Files

| Path | Description |
|------|-------------|
| `data/311-raw.json` | Raw 311 API response |
| `data/permits-raw.json` | Building permits raw JSON |
| `data/crime-raw.json` | Crime reports raw JSON |
| `data/violations-raw.json` | Property violations raw JSON |
| `data/dangerous-buildings-raw.json` | Dangerous buildings raw JSON |
| `data/budget-expenditures-raw.json` | Budget expenditures raw JSON |
| `data/budget-revenue-raw.json` | Budget revenue raw JSON |
| `data/vendor-payments-raw.json` | Vendor payments raw JSON |
| `data/neighborhood-os.db` | SQLite database (all tables) |
| `digests/YYYY-MM-DD.md` | Weekly digest archives |

---

## Database Schema

**`requests_311`** — 311 service requests
- `case_id` (PK), `department`, `request_type`, `category`, `type`
- `creation_date`, `status`, `street_address`, `lat`, `lon`
- `last_seen` — timestamp of last ingest

**`permits`** — Building permits
- `permit_no` (PK), `permit_type`, `work_description`, `address`, `neighborhood`
- `status`, `applied_date`, `issued_date`, `finaled_date`, `estimated_value`, `contractor`
- `lat`, `lon`, `last_seen`

**`crime`** — Crime reports
- `report_no` (PK), `offense`, `description`, `address`, `area`
- `reported_date`, `from_date`, `lat`, `lon`, `last_seen`

**`property_violations`** — Property code violations
- `case_no` (PK), `violation_code`, `violation_description`, `address`, `neighborhood`
- `status`, `opened_date`, `closed_date`, `lat`, `lon`, `last_seen`

**`dangerous_buildings`** — Dangerous/unsafe building cases
- `case_number` (PK), `address`, `neighborhood`, `status`
- `case_opened`, `council_district`, `zip_code`, `lat`, `lon`, `last_seen`

**`budget`** — City budget line items (expenditures + revenue)
- `id` (PK, composite), `fiscal_year`, `fund`, `department`, `division`
- `account`, `description`, `budget_type` (revenue/expenditure), `amount`, `last_seen`

**`vendor_payments`** — City vendor/contractor payments
- `id` (PK), `vendor_name`, `department`, `amount`, `payment_date`
- `description`, `fiscal_year`, `last_seen`

**`commitments`** — City official commitments
- `id`, `official_name`, `role`, `meeting_date`
- `commitment_text`, `follow_up_date`
- `status` (open/closed), `outcome_notes`, `created_at`

**`digest_log`** — History of generated digests

---

## West Waldo Boundary

Bounding box used for 311 filtering:
- Latitude: 38.97 – 38.99
- Longitude: -94.60 – -94.57

Roughly: 75th–79th Street, Wornall–State Line area.

---

## Requirements

- Node.js 18+ (uses native `fetch`)
- `better-sqlite3` (installed via `npm install`)
- Ollama + gemma4:26b (or any model) for `ask.js`
  - Pull: `ollama pull gemma3:12b` (smaller/faster option)

---

## Roadmap

- [ ] Automated weekly digest via cron
- [ ] Email delivery (Markdown → email)
- [ ] Web dashboard (static HTML, no server)
- [ ] Meeting minutes ingestion + commitment auto-detection
- [ ] Federation layer (cross-neighborhood comparison)
- [ ] Layer 2: Neighborhood Health Index

---

*NeighborhoodOS v0.1 · West Waldo, KCMO · Built with WaldoNet*
