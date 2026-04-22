/**
 * fetch-all.js
 * Fetches all KC Open Data sources for West Waldo and saves raw JSON to data/.
 *
 * Datasets:
 *   permits-raw.json          ntw8-aacc  Building permits
 *   crime-raw.json            gqy2-yvmn  Crime reports (2015+)
 *   violations-raw.json       tezm-fh2e  Open property violations
 *   dangerous-buildings-raw.json ax3m-jhxx Dangerous/unsafe buildings
 *   budget-expenditures-raw.json ygzn-3xmu FY23-24 expenditures
 *   budget-revenue-raw.json   rv2u-bdnp  FY23-24 revenue
 *   vendor-payments-raw.json  39kh-2k2z  2024 vendor payments
 *
 * Geo strategy (for datasets with location):
 *   1. Try within_box() geo filter
 *   2. Fall back to neighborhood name filter (lower(neighborhood) like '%waldo%')
 *   3. Fall back to unfiltered fetch (budget/vendor only - capped at 5000)
 */

const fs   = require('fs');
const path = require('path');

const BASE  = 'https://data.kcmo.org/resource';
const LIMIT = 1000;

// West Waldo bounding box
const BOUNDS = {
  minLat: 38.97, maxLat: 38.99,
  minLon: -94.60, maxLon: -94.57,
};

// Departments relevant to Waldo for budget filtering
const BUDGET_DEPT_KEYWORDS = ['parks', 'public works', 'nhs', 'neighborhood', 'housing', 'planning'];

const DATA_DIR = path.join(__dirname, 'data');

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Paginate through a dataset with a given $where clause.
 * Returns [] on first-page failure (caller tries next strategy).
 * @param {string} datasetId
 * @param {string|null} where   SoQL $where clause, or null for no filter
 * @param {string|null} order   SoQL $order clause
 * @param {number} maxRecords   Hard cap (avoid runaway fetches)
 */
async function paginate(datasetId, where, order, maxRecords = 5000) {
  let records = [];
  let offset  = 0;

  while (records.length < maxRecords) {
    const params = new URLSearchParams({ $limit: LIMIT, $offset: offset });
    if (where) params.set('$where', where);
    if (order) params.set('$order', order);

    const url = `${BASE}/${datasetId}.json?${params}`;
    let batch;
    try {
      batch = await fetchPage(url);
    } catch (err) {
      if (offset === 0) throw err; // propagate first-page errors
      console.warn(`    ⚠ Pagination stopped at offset ${offset}: ${err.message}`);
      break;
    }

    if (!Array.isArray(batch) || batch.length === 0) break;
    records = records.concat(batch);
    console.log(`    offset=${offset}: ${batch.length} records (running: ${records.length})`);
    if (batch.length < LIMIT) break;
    offset += LIMIT;
  }

  return records;
}

/**
 * Fetch a geo-tagged dataset with a graceful fallback chain.
 * @param {string} datasetId
 * @param {string} geoField    e.g. 'mapped_location' or 'location'
 * @param {string|null} order
 * @param {number} maxRecords
 */
async function fetchGeo(datasetId, geoField, order = null, maxRecords = 5000) {
  // Strategy 1: within_box geo filter
  const geoWhere = `within_box(${geoField}, ${BOUNDS.minLat}, ${BOUNDS.minLon}, ${BOUNDS.maxLat}, ${BOUNDS.maxLon})`;
  try {
    console.log(`  Trying geo filter (within_box)...`);
    const recs = await paginate(datasetId, geoWhere, order, maxRecords);
    if (recs.length >= 0) return { records: recs, strategy: 'geo' }; // 0 is still valid
  } catch (err) {
    console.warn(`  Geo filter failed (${err.message}), trying neighborhood filter...`);
  }

  // Strategy 2: neighborhood name filter
  try {
    const nameWhere = `lower(neighborhood) like '%waldo%'`;
    console.log(`  Trying neighborhood name filter...`);
    const recs = await paginate(datasetId, nameWhere, order, maxRecords);
    return { records: recs, strategy: 'neighborhood' };
  } catch (err) {
    console.warn(`  Neighborhood filter failed (${err.message}), fetching unfiltered...`);
  }

  // Strategy 3: no filter at all
  const recs = await paginate(datasetId, null, order, maxRecords);
  return { records: recs, strategy: 'unfiltered' };
}

/**
 * Fetch a non-geo dataset. Optionally apply a $where clause. Falls back to
 * unfiltered if the filter fails.
 */
async function fetchNoGeo(datasetId, where = null, order = null, maxRecords = 5000) {
  try {
    const recs = await paginate(datasetId, where, order, maxRecords);
    return { records: recs, strategy: where ? 'filtered' : 'unfiltered' };
  } catch (err) {
    if (!where) throw err;
    console.warn(`  Filter failed (${err.message}), fetching unfiltered...`);
    const recs = await paginate(datasetId, null, order, maxRecords);
    return { records: recs, strategy: 'unfiltered' };
  }
}

function save(filename, records) {
  const outPath = path.join(DATA_DIR, filename);
  fs.writeFileSync(outPath, JSON.stringify(records, null, 2));
  return outPath;
}

// ─── Dataset fetchers ─────────────────────────────────────────────────────────

async function fetchPermits() {
  // Real schema has latitude/longitude as TEXT columns always literally 'NULL' —
  // no geocoding in this dataset. Fall back to ZIP-based filter: West Waldo
  // overlaps ZIPs 64113 and 64114. Limit to applications since 2020 to keep
  // the working set manageable (~7–8k records). Post-ingest we further narrow
  // by address keywords in the digest/ask queries.
  console.log('\n→ Building Permits (ntw8-aacc)');
  try {
    const where = `originalzip in ('64113','64114') AND applieddate > '2020-01-01'`;
    const result = await fetchNoGeo('ntw8-aacc', where, 'applieddate DESC', 10000);
    save('permits-raw.json', result.records);
    console.log(`  ✓ ${result.records.length} permits [${result.strategy}] (ZIPs 64113/64114 since 2020)`);
    return result.records;
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return [];
  }
}

async function fetchCrime() {
  // Real schema: geoloc is the Point-type geo field (location is a text POINT string).
  // Fields: report_no, offense_type (not 'offense'), description, address, area,
  // reported_date, latitude, longitude.
  console.log('\n→ Crime Reports (gqy2-yvmn)');
  try {
    const result = await fetchGeo('gqy2-yvmn', 'geoloc', 'reported_date DESC', 10000);
    save('crime-raw.json', result.records);
    console.log(`  ✓ ${result.records.length} crime reports [${result.strategy}]`);
    return result.records;
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return [];
  }
}

async function fetchViolations() {
  // Real schema: lat_long is the Point geo field, workorder_ is the case id,
  // issue_type / issue_sub_type, current_status, open_date_time, incident_address,
  // latitude, longitude. No 'neighborhood' column.
  console.log('\n→ Property Violations (tezm-fh2e)');
  try {
    const result = await fetchGeo('tezm-fh2e', 'lat_long', 'open_date_time DESC', 5000);
    save('violations-raw.json', result.records);
    console.log(`  ✓ ${result.records.length} violations [${result.strategy}]`);
    return result.records;
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return [];
  }
}

async function fetchDangerousBuildings() {
  console.log('\n→ Dangerous Buildings (ax3m-jhxx)');
  try {
    // This dataset likely uses neighborhood='Waldo' text filter
    let result;
    try {
      result = await fetchGeo('ax3m-jhxx', 'case_location', 'case_opened DESC');
    } catch {
      result = await fetchNoGeo('ax3m-jhxx', `lower(neighborhood) like '%waldo%'`, 'case_opened DESC');
    }
    save('dangerous-buildings-raw.json', result.records);
    console.log(`  ✓ ${result.records.length} dangerous buildings [${result.strategy}]`);
    return result.records;
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return [];
  }
}

async function fetchBudgetExpenditures() {
  console.log('\n→ Budget Expenditures (ygzn-3xmu)');
  try {
    // No geo filter — fetch by department keywords
    const deptWhere = BUDGET_DEPT_KEYWORDS
      .map(kw => `lower(department) like '%${kw}%'`)
      .join(' OR ');
    const result = await fetchNoGeo('ygzn-3xmu', deptWhere, null, 5000);
    save('budget-expenditures-raw.json', result.records);
    console.log(`  ✓ ${result.records.length} expenditure lines [${result.strategy}]`);
    return result.records;
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return [];
  }
}

async function fetchBudgetRevenue() {
  console.log('\n→ Budget Revenue (rv2u-bdnp)');
  try {
    const result = await fetchNoGeo('rv2u-bdnp', null, null, 5000);
    save('budget-revenue-raw.json', result.records);
    console.log(`  ✓ ${result.records.length} revenue lines [${result.strategy}]`);
    return result.records;
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return [];
  }
}

async function fetchVendorPayments() {
  console.log('\n→ Vendor Payments (39kh-2k2z)');
  try {
    const result = await fetchNoGeo('39kh-2k2z', null, 'payment_date DESC', 5000);
    save('vendor-payments-raw.json', result.records);
    console.log(`  ✓ ${result.records.length} vendor payments [${result.strategy}]`);
    return result.records;
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return [];
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  console.log('NeighborhoodOS — Multi-source KC Open Data fetch');
  console.log('================================================');
  console.log(`Bounding box: lat ${BOUNDS.minLat}–${BOUNDS.maxLat}, lon ${BOUNDS.minLon}–${BOUNDS.maxLon}`);

  const results = {};
  const failures = [];

  const tasks = [
    ['permits',              fetchPermits],
    ['crime',                fetchCrime],
    ['violations',           fetchViolations],
    ['dangerous_buildings',  fetchDangerousBuildings],
    ['budget_expenditures',  fetchBudgetExpenditures],
    ['budget_revenue',       fetchBudgetRevenue],
    ['vendor_payments',      fetchVendorPayments],
  ];

  for (const [name, fn] of tasks) {
    try {
      results[name] = await fn();
    } catch (err) {
      console.error(`\n✗ ${name} crashed: ${err.message}`);
      results[name] = [];
      failures.push(name);
    }
  }

  // ── Summary ──
  console.log('\n\n════ FETCH SUMMARY ════');
  for (const [name, recs] of Object.entries(results)) {
    const status = failures.includes(name) ? '✗ FAILED' : `✓ ${recs.length} records`;
    console.log(`  ${name.padEnd(22)} ${status}`);
  }

  const total = Object.values(results).reduce((s, r) => s + r.length, 0);
  console.log(`\n  Total: ${total} records across ${tasks.length} sources`);

  if (failures.length) {
    console.log(`\n  Failed sources: ${failures.join(', ')}`);
    console.log('  These failures are non-fatal — successfully-fetched sources are still saved.');
  }

  console.log(`\n  Data saved to: ${DATA_DIR}`);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
