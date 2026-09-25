// neighborhoodos/core/db.js
// Secure database wrapper enforcing the Civic Memory Safety Doctrine at the SQL and JS level.
// Wraps a better-sqlite3 Database instance using a Proxy to intercept and audit queries.

import Database from 'better-sqlite3';

export class CivicSafetyViolationError extends Error {
  constructor(message) {
    super(`[CivicSafetyViolation] ${message}`);
    this.name = 'CivicSafetyViolationError';
  }
}

// Blocklists defined in the NeighborhoodOS Civic Memory Safety Doctrine
const FORBIDDEN_TABLES = [
  'resident_dossiers',
  'police_predictions',
  'protest_logs',
  'social_media_profiles',
  'immigration_checks',
  'tracking_events',
  'individual_scores',
  'behavior_scores'
];

const FORBIDDEN_COLUMNS = [
  'resident_score',
  'threat_level',
  'risk_score',
  'behavior_score',
  'demographic_category',
  'political_affiliation',
  'location_patterns'
];

const FORBIDDEN_PATTERNS = [
  /correlation_id/i,
  /deanonymize/i,
  /cross_reference_identity/i,
  /predictive_policing/i
];

/**
 * Audit and validate SQL query against the Civic Memory Safety Doctrine.
 * Throws CivicSafetyViolationError if any forbidden terms are matched.
 */
export function validateSQL(sql) {
  if (typeof sql !== 'string') return;

  const normalized = sql.toLowerCase().replace(/\s+/g, ' ');

  // 1. Check for blocked table creations or queries
  for (const table of FORBIDDEN_TABLES) {
    const tablePattern = new RegExp(`\\b${table}\\b`, 'i');
    if (tablePattern.test(normalized)) {
      throw new CivicSafetyViolationError(
        `Access to prohibited table '${table}' is blocked. Under the safety doctrine, we do not store predictive policing, resident dossiers, or protest tracking data.`
      );
    }
  }

  // 2. Check for blocked column creations or selections
  for (const column of FORBIDDEN_COLUMNS) {
    const colPattern = new RegExp(`\\b${column}\\b`, 'i');
    if (colPattern.test(normalized)) {
      throw new CivicSafetyViolationError(
        `Prohibited database field '${column}' detected. NeighborhoodOS is programmatically barred from storing individual resident scores, threat levels, or behavioral categories.`
      );
    }
  }

  // 3. Check for suspicious correlation queries attempting to tie civic open-data
  // directly to private contact records.
  if (
    (normalized.includes('users') || normalized.includes('identity')) &&
    (normalized.includes('requests_311') || normalized.includes('crime') || normalized.includes('permits'))
  ) {
    // Check if the query attempts to perform an un-audited direct join of personal identifiers with municipal records
    if (normalized.includes('join') && (normalized.includes('email_hash') || normalized.includes('phone_hash'))) {
      throw new CivicSafetyViolationError(
        'Direct database join between personal identity tables and public municipal records is blocked to prevent de-anonymization and resident profiling.'
      );
    }
  }

  // 4. Pattern matching
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new CivicSafetyViolationError(
        `Prohibited pattern or methodology matched: ${pattern.toString()}.`
      );
    }
  }
}

/**
 * Factory to wrap a standard better-sqlite3 database instance
 * with a Proxy to enforce safety checks on all queries.
 */
export function createSecureDatabase(dbPath, options = {}) {
  const rawDb = new Database(dbPath, options);
  return wrapSecureDatabase(rawDb);
}

/**
 * Wrap an already-open better-sqlite3 Database with the safety proxy.
 * Every exec() and prepare() is checked against the doctrine first.
 * Blocked attempts are written to system_safety_audit (append-only).
 */
export function wrapSecureDatabase(rawDb) {
  rawDb.pragma('journal_mode = WAL');
  rawDb.pragma('foreign_keys = ON');

  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS system_safety_audit (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp    TEXT NOT NULL DEFAULT (datetime('now')),
      action_type  TEXT NOT NULL,
      query        TEXT,
      status       TEXT NOT NULL,
      details      TEXT
    );
    CREATE TRIGGER IF NOT EXISTS system_safety_audit_no_update
    BEFORE UPDATE ON system_safety_audit
    BEGIN SELECT RAISE(ABORT, 'system_safety_audit is append-only'); END;
    CREATE TRIGGER IF NOT EXISTS system_safety_audit_no_delete
    BEFORE DELETE ON system_safety_audit
    BEGIN SELECT RAISE(ABORT, 'system_safety_audit is append-only'); END;
  `);

  const logStmt = rawDb.prepare(`
    INSERT INTO system_safety_audit (action_type, query, status, details)
    VALUES (?, ?, ?, ?)
  `);
  const log = (type, sql, status, details) => {
    try { logStmt.run(type, String(sql).slice(0, 4000), status, details); } catch { /* never mask the real error */ }
  };

  const guard = (type, sql) => {
    try {
      validateSQL(sql);
    } catch (err) {
      log(type, sql, 'BLOCKED', err.message);
      throw err;
    }
  };

  const handler = {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);

      if (prop === 'exec') {
        return function (sql) {
          guard('exec', sql);
          return val.call(target, sql);
        };
      }

      if (prop === 'prepare') {
        return function (sql) {
          guard('prepare', sql);
          return val.call(target, sql);
        };
      }

      if (prop === 'unsafeRaw') return target; // explicit, greppable escape hatch for migrations tooling only

      if (typeof val === 'function') return val.bind(target);
      return val;
    }
  };

  return new Proxy(rawDb, handler);
}
