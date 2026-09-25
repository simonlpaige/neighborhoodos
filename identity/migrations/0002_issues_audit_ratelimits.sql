-- 0002_issues_audit_ratelimits.sql
-- Tables used by issues.js, audit.js and rate-limit.js that were never
-- committed to the base schema. Shapes match the code that reads/writes them.

CREATE TABLE IF NOT EXISTS resident_issues (
  id                TEXT PRIMARY KEY,
  reporter_blind_id TEXT NOT NULL,          -- per-issue blinded reporter, never a raw user id
  category          TEXT NOT NULL DEFAULT 'other',
  title             TEXT NOT NULL,
  body              TEXT NOT NULL,
  geo_hint          TEXT,                   -- coarse hint only (block / intersection), never a home address
  status            TEXT NOT NULL DEFAULT 'open',  -- open | acknowledged | resolved
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  acknowledged_at   TEXT,
  acknowledged_by   TEXT,
  resolved_at       TEXT,
  resolved_by       TEXT,
  resolution_note   TEXT
);
CREATE INDEX IF NOT EXISTS idx_resident_issues_status ON resident_issues(status, created_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id             TEXT PRIMARY KEY,
  actor_user_id  TEXT,
  actor_ip_hash  TEXT,                      -- HMAC of IP with node-local salt
  action         TEXT NOT NULL,
  target_type    TEXT,
  target_id      TEXT,
  payload_json   TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action, created_at);

-- The audit log is append-only. Updates and deletes are refused at the DB level.
CREATE TRIGGER IF NOT EXISTS audit_log_no_update
BEFORE UPDATE ON audit_log
BEGIN SELECT RAISE(ABORT, 'audit_log is append-only'); END;

CREATE TRIGGER IF NOT EXISTS audit_log_no_delete
BEFORE DELETE ON audit_log
BEGIN SELECT RAISE(ABORT, 'audit_log is append-only'); END;

CREATE TABLE IF NOT EXISTS rate_limits (
  key           TEXT PRIMARY KEY,
  count         INTEGER NOT NULL DEFAULT 0,
  window_start  INTEGER NOT NULL           -- epoch ms
);
