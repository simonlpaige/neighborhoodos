/**
 * ingest.js
 * Reads data/311-raw.json and upserts records into the requests_311 table.
 * Tracks new vs. updated records.
 * Run after fetch-311.js.
 */

const fs = require('fs');
const path = require('path');
const { getDb } = require('./db');

const RAW_PATH = path.join(__dirname, 'data', '311-raw.json');

function loadRaw() {
  if (!fs.existsSync(RAW_PATH)) {
    console.error(`Error: ${RAW_PATH} not found. Run "node fetch-311.js" first.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));
}

function main() {
  const db = getDb();
  const records = loadRaw();

  if (!Array.isArray(records) || records.length === 0) {
    console.log('No records in raw file. Nothing to ingest.');
    return;
  }

  const now = new Date().toISOString();

  // Prepared statements for upsert
  const existsStmt = db.prepare('SELECT case_id, status FROM requests_311 WHERE case_id = ?');
  const insertStmt = db.prepare(`
    INSERT INTO requests_311 (case_id, department, request_type, category, type,
      creation_date, status, street_address, lat, lon, days_open, neighborhood, last_seen)
    VALUES (@case_id, @department, @request_type, @category, @type,
      @creation_date, @status, @street_address, @lat, @lon, @days_open, @neighborhood, @last_seen)
  `);
  const updateStmt = db.prepare(`
    UPDATE requests_311
    SET department = @department,
        request_type = @request_type,
        category = @category,
        type = @type,
        status = @status,
        street_address = @street_address,
        lat = @lat,
        lon = @lon,
        days_open = @days_open,
        neighborhood = @neighborhood,
        last_seen = @last_seen
    WHERE case_id = @case_id
  `);

  let newCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  const upsertAll = db.transaction(() => {
    for (const raw of records) {
      const case_id = raw.case_id;
      if (!case_id) {
        skippedCount++;
        continue;
      }

      // Fallback to `_raw` for fields that older fetches didn't hoist onto the normalized record.
      const rr = raw._raw || {};
      // Use days_open for active cases, days_to_close for resolved ones.
      // This gives us one comparable number per record: how long the city took (or is taking).
      let daysOpenRaw = raw.days_open != null ? parseInt(raw.days_open, 10)
                       : (rr.days_open != null ? parseInt(rr.days_open, 10) : null);
      if (daysOpenRaw == null && rr.days_to_close != null) {
        daysOpenRaw = parseInt(rr.days_to_close, 10);
      }

      const row = {
        case_id,
        department: raw.department || rr.department || null,
        request_type: raw.request_type || rr.request_type || null,
        category: raw.category || rr.category || null,
        type: raw.type || rr.type || null,
        creation_date: raw.creation_date || rr.creation_date || null,
        status: raw.status || rr.status || null,
        street_address: raw.street_address || rr.street_address || null,
        lat: raw.lat || null,
        lon: raw.lon || null,
        days_open: daysOpenRaw,
        neighborhood: raw.neighborhood || rr.neighborhood || null,
        last_seen: now,
      };

      const existing = existsStmt.get(case_id);
      if (!existing) {
        insertStmt.run(row);
        newCount++;
      } else {
        // Update if status changed or just refresh last_seen
        updateStmt.run(row);
        updatedCount++;
      }
    }
  });

  upsertAll();

  const totalStmt = db.prepare('SELECT COUNT(*) AS n FROM requests_311').get();

  console.log(`Ingest complete:`);
  console.log(`  New:     ${newCount}`);
  console.log(`  Updated: ${updatedCount}`);
  console.log(`  Skipped (no case_id): ${skippedCount}`);
  console.log(`  Total in DB: ${totalStmt.n}`);

  db.close();
}

main();
