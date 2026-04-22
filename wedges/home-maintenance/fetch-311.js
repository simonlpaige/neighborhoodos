/**
 * fetch-311.js
 * Pulls 311 service requests from KC Open Data filtered to West Waldo.
 * Uses dataset 7at3-sxhp (2007-2021) with geocoded fallback to g7yw-jg39 (live).
 * Saves raw results to data/311-raw.json
 */

const fs = require('fs');
const path = require('path');

// West Waldo bounding box
const BOUNDS = {
  minLat: 38.97,
  maxLat: 38.99,
  minLon: -94.60,
  maxLon: -94.57,
};

const DATASETS = [
  {
    id: '7at3-sxhp',
    label: '311 Historical (2007-2021)',
    geoField: 'address_with_geocode',
  },
  {
    id: 'g7yw-jg39',
    label: '311 Live',
    geoField: 'address_with_geocode',
  },
];

const BASE = 'https://data.kcmo.org/resource';
const LIMIT = 1000;

function buildUrl(datasetId, geoField, offset = 0) {
  const where = `within_box(${geoField}, ${BOUNDS.minLat}, ${BOUNDS.minLon}, ${BOUNDS.maxLat}, ${BOUNDS.maxLon})`;
  const params = new URLSearchParams({
    $where: where,
    $limit: LIMIT,
    $offset: offset,
    $order: 'creation_date DESC',
  });
  return `${BASE}/${datasetId}.json?${params.toString()}`;
}

async function fetchDataset(dataset) {
  const { id, label, geoField } = dataset;
  let allRecords = [];
  let offset = 0;

  console.log(`\n→ Fetching ${label} (${id})...`);

  while (true) {
    const url = buildUrl(id, geoField, offset);
    let res;
    try {
      res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });
    } catch (err) {
      console.error(`  Network error on ${id}: ${err.message}`);
      break;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`  HTTP ${res.status} on ${id}: ${body.slice(0, 200)}`);
      break;
    }

    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    allRecords = allRecords.concat(batch);
    console.log(`  Page offset=${offset}: got ${batch.length} records (running total: ${allRecords.length})`);

    if (batch.length < LIMIT) break; // last page
    offset += LIMIT;
  }

  return allRecords;
}

function normalizeRecord(raw, datasetId) {
  // Extract lat/lon from the geocode field — can be object or string
  let lat = null;
  let lon = null;

  const geo = raw.address_with_geocode;
  if (geo) {
    if (typeof geo === 'object' && geo.latitude) {
      lat = parseFloat(geo.latitude);
      lon = parseFloat(geo.longitude);
    } else if (typeof geo === 'string') {
      // Sometimes comes as "POINT (lon lat)" or "(lat, lon)"
      const pointMatch = geo.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/i);
      if (pointMatch) {
        lon = parseFloat(pointMatch[1]);
        lat = parseFloat(pointMatch[2]);
      }
    }
  }

  // Fallback: top-level lat/lon columns (live dataset)
  if (!lat && raw.latitude) lat = parseFloat(raw.latitude);
  if (!lon && raw.longitude) lon = parseFloat(raw.longitude);

  return {
    case_id: raw.case_id || raw.id || null,
    source: raw.source || null,
    department: raw.department || null,
    request_type: raw.request_type || null,
    category: raw.category || null,
    type: raw.type || null,
    creation_date: raw.creation_date || null,
    status: raw.status || null,
    street_address: raw.street_address || raw.address || null,
    neighborhood: raw.neighborhood || null,
    days_open: raw.days_open != null ? parseInt(raw.days_open, 10) : null,
    lat,
    lon,
    _dataset: datasetId,
    _raw: raw, // keep raw for debugging
  };
}

async function main() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  let combined = [];
  const seenIds = new Set();

  for (const dataset of DATASETS) {
    const records = await fetchDataset(dataset);
    const normalized = records.map(r => normalizeRecord(r, dataset.id));

    // Deduplicate by case_id across datasets
    for (const rec of normalized) {
      const key = rec.case_id || `${rec._dataset}:${rec.creation_date}:${rec.street_address}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        combined.push(rec);
      }
    }
  }

  const outPath = path.join(dataDir, '311-raw.json');
  fs.writeFileSync(outPath, JSON.stringify(combined, null, 2));

  console.log(`\n✓ Total records fetched: ${combined.length}`);
  console.log(`  Saved to: ${outPath}`);

  // Quick summary by category
  const cats = {};
  for (const r of combined) {
    const k = r.category || r.request_type || 'Unknown';
    cats[k] = (cats[k] || 0) + 1;
  }
  const top = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (top.length) {
    console.log('\n  Top categories:');
    for (const [cat, count] of top) {
      console.log(`    ${count.toString().padStart(4)}  ${cat}`);
    }
  }

  // Date range
  const dates = combined.map(r => r.creation_date).filter(Boolean).sort();
  if (dates.length) {
    console.log(`\n  Date range: ${dates[0].slice(0, 10)} → ${dates[dates.length - 1].slice(0, 10)}`);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
