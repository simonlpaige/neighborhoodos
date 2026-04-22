/**
 * db.js
 * SQLite database setup for NeighborhoodOS.
 * Call getDb() to get an initialized database connection.
 * Automatically creates tables on first run.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'neighborhood-os.db');

function getDb() {
  // Ensure data dir exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const db = new Database(DB_PATH);

  // Performance settings
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema(db);
  return db;
}

function initSchema(db) {
  db.exec(`
    -- 311 service requests from KC Open Data
    CREATE TABLE IF NOT EXISTS requests_311 (
      case_id        TEXT PRIMARY KEY,
      department     TEXT,
      request_type   TEXT,
      category       TEXT,
      type           TEXT,
      creation_date  TEXT,   -- ISO timestamp
      status         TEXT,
      street_address TEXT,
      lat            REAL,
      lon            REAL,
      days_open      INTEGER, -- days from open to close (or to last snapshot if still open)
      neighborhood   TEXT,
      last_seen      TEXT    -- ISO timestamp of last ingest
    );

    CREATE INDEX IF NOT EXISTS idx_requests_creation ON requests_311(creation_date);
    CREATE INDEX IF NOT EXISTS idx_requests_status   ON requests_311(status);
    CREATE INDEX IF NOT EXISTS idx_requests_category ON requests_311(category);

    -- Commitments made by city officials / developers at meetings
    CREATE TABLE IF NOT EXISTS commitments (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      official_name    TEXT NOT NULL,
      role             TEXT,
      meeting_date     TEXT,   -- YYYY-MM-DD
      commitment_text  TEXT NOT NULL,
      follow_up_date   TEXT,   -- YYYY-MM-DD
      status           TEXT NOT NULL DEFAULT 'open',  -- open | closed
      outcome_notes    TEXT,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_commitments_status       ON commitments(status);
    CREATE INDEX IF NOT EXISTS idx_commitments_follow_up    ON commitments(follow_up_date);

    -- Log of generated digests
    CREATE TABLE IF NOT EXISTS digest_log (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      generated_at  TEXT NOT NULL DEFAULT (datetime('now')),
      summary_text  TEXT NOT NULL
    );

    -- Building permits (KC Open Data: ntw8-aacc)
    CREATE TABLE IF NOT EXISTS permits (
      permit_no        TEXT PRIMARY KEY,
      permit_type      TEXT,
      work_description TEXT,
      address          TEXT,
      neighborhood     TEXT,
      status           TEXT,
      applied_date     TEXT,
      issued_date      TEXT,
      finaled_date     TEXT,
      estimated_value  REAL,
      contractor       TEXT,
      lat              REAL,
      lon              REAL,
      last_seen        TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_permits_type    ON permits(permit_type);
    CREATE INDEX IF NOT EXISTS idx_permits_applied ON permits(applied_date);

    -- Crime reports (KC Open Data: gqy2-yvmn)
    CREATE TABLE IF NOT EXISTS crime (
      report_no     TEXT PRIMARY KEY,
      offense       TEXT,
      description   TEXT,
      address       TEXT,
      area          TEXT,
      reported_date TEXT,
      from_date     TEXT,
      lat           REAL,
      lon           REAL,
      last_seen     TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_crime_reported ON crime(reported_date);
    CREATE INDEX IF NOT EXISTS idx_crime_offense  ON crime(offense);

    -- Open property violations (KC Open Data: tezm-fh2e)
    CREATE TABLE IF NOT EXISTS property_violations (
      case_no              TEXT PRIMARY KEY,
      violation_code       TEXT,
      violation_description TEXT,
      address              TEXT,
      neighborhood         TEXT,
      status               TEXT,
      opened_date          TEXT,
      closed_date          TEXT,
      lat                  REAL,
      lon                  REAL,
      last_seen            TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_violations_opened ON property_violations(opened_date);

    -- Dangerous buildings (KC Open Data: ax3m-jhxx)
    CREATE TABLE IF NOT EXISTS dangerous_buildings (
      case_number      TEXT PRIMARY KEY,
      address          TEXT,
      neighborhood     TEXT,
      status           TEXT,
      case_opened      TEXT,
      council_district TEXT,
      zip_code         TEXT,
      lat              REAL,
      lon              REAL,
      last_seen        TEXT
    );

    -- City budget line items (KC Open Data: ygzn-3xmu / rv2u-bdnp)
    CREATE TABLE IF NOT EXISTS budget (
      id          TEXT PRIMARY KEY,
      fiscal_year TEXT,
      fund        TEXT,
      department  TEXT,
      division    TEXT,
      account     TEXT,
      description TEXT,
      budget_type TEXT,   -- 'revenue' or 'expenditure'
      amount      REAL,
      last_seen   TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_budget_dept ON budget(department);
    CREATE INDEX IF NOT EXISTS idx_budget_type ON budget(budget_type);

    -- Vendor payments (who the city pays) (KC Open Data: 39kh-2k2z)
    CREATE TABLE IF NOT EXISTS vendor_payments (
      id           TEXT PRIMARY KEY,
      vendor_name  TEXT,
      department   TEXT,
      amount       REAL,
      payment_date TEXT,
      description  TEXT,
      fiscal_year  TEXT,
      last_seen    TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_vendor_name ON vendor_payments(vendor_name);
    CREATE INDEX IF NOT EXISTS idx_vendor_dept ON vendor_payments(department);

    -- Zoning (KC Open Data parcel data)
    CREATE TABLE IF NOT EXISTS zoning (
      pin              TEXT PRIMARY KEY,
      address          TEXT,
      zone_class       TEXT,
      zone_description TEXT,
      neighborhood     TEXT,
      lat              REAL,
      lon              REAL,
      last_seen        TEXT
    );

    -- Upcoming and past civic meetings (Legistar)
    CREATE TABLE IF NOT EXISTS civic_meetings (
      event_id       INTEGER PRIMARY KEY,
      body_name      TEXT,
      body_id        INTEGER,
      event_date     TEXT,
      event_location TEXT,
      agenda_file    TEXT,
      minutes_file   TEXT,
      agenda_status  TEXT,
      minutes_status TEXT,
      last_seen      TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_meetings_date ON civic_meetings(event_date);
    CREATE INDEX IF NOT EXISTS idx_meetings_body ON civic_meetings(body_name);

    -- Legislation: ordinances, resolutions, etc. (Legistar)
    CREATE TABLE IF NOT EXISTS legislation (
      matter_id     INTEGER PRIMARY KEY,
      matter_type   TEXT,
      title         TEXT,
      sponsor       TEXT,
      status        TEXT,
      intro_date    TEXT,
      passed_date   TEXT,
      file_number   TEXT,
      body_name     TEXT,
      last_modified TEXT,
      last_seen     TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_legislation_type   ON legislation(matter_type);
    CREATE INDEX IF NOT EXISTS idx_legislation_status ON legislation(status);
    CREATE INDEX IF NOT EXISTS idx_legislation_intro  ON legislation(intro_date);

    -- Votes on legislation (Legistar)
    CREATE TABLE IF NOT EXISTS votes (
      vote_id     INTEGER PRIMARY KEY,
      matter_id   INTEGER,
      action      TEXT,
      action_date TEXT,
      result      TEXT,
      body_name   TEXT,
      last_seen   TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_votes_matter ON votes(matter_id);

    -- Tracked policy keywords — items flagged as relevant to Waldo/neighborhood
    CREATE TABLE IF NOT EXISTS policy_flags (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      source     TEXT,       -- 'legislation' or 'meeting'
      source_id  INTEGER,
      flag_reason TEXT,
      flagged_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_policy_flags_source ON policy_flags(source, source_id);
  `);
}


// Lightweight schema info for debugging
function showStats(db) {
  const r  = db.prepare('SELECT COUNT(*) AS n FROM requests_311').get();
  const c  = db.prepare('SELECT COUNT(*) AS n FROM commitments').get();
  const p  = db.tableExists ? '' : '';
  const tables = ['permits','crime','property_violations','dangerous_buildings','budget','vendor_payments','zoning'];
  const extras = tables.map(t => {
    try { return `${t}: ${db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n}`; }
    catch { return `${t}: (table missing)`; }
  });
  console.log(`DB: ${r.n} 311 requests, ${c.n} commitments`);
  console.log(`    ${extras.join(', ')}`);
}

module.exports = { getDb, showStats, DB_PATH };
