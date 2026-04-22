/**
 * ingest-meetings.js
 * Ingests civic meetings and legislation from JSON files into SQLite.
 *
 * Reads:
 *   data/meetings-upcoming.json
 *   data/meetings-recent.json
 *   data/legislation-recent.json
 *   data/legislation-flagged.json
 *
 * Usage: node ingest-meetings.js
 */

const fs = require('fs');
const path = require('path');
const { getDb } = require('./db');

const DATA_DIR = path.join(__dirname, 'data');

function parseLegistarDate(val) {
  if (!val) return null;
  try {
    return new Date(val).toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function loadJson(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`  [skip] ${filename} not found — run fetch-meetings.js first`);
    return null;
  }
  const raw = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(raw);
}

// ── Ingest meetings ──

function ingestMeetings(db, events, label) {
  if (!events || events.length === 0) {
    console.log(`  ${label}: 0 events, nothing to ingest`);
    return 0;
  }

  const now = new Date().toISOString();

  const upsert = db.prepare(`
    INSERT INTO civic_meetings (
      event_id, body_name, body_id, event_date, event_location,
      agenda_file, minutes_file, agenda_status, minutes_status, last_seen
    ) VALUES (
      @event_id, @body_name, @body_id, @event_date, @event_location,
      @agenda_file, @minutes_file, @agenda_status, @minutes_status, @last_seen
    )
    ON CONFLICT(event_id) DO UPDATE SET
      body_name      = excluded.body_name,
      body_id        = excluded.body_id,
      event_date     = excluded.event_date,
      event_location = excluded.event_location,
      agenda_file    = excluded.agenda_file,
      minutes_file   = excluded.minutes_file,
      agenda_status  = excluded.agenda_status,
      minutes_status = excluded.minutes_status,
      last_seen      = excluded.last_seen
  `);

  const ingestMany = db.transaction((rows) => {
    let count = 0;
    for (const e of rows) {
      if (!e.EventId) continue;
      upsert.run({
        event_id:       e.EventId,
        body_name:      e.EventBodyName || null,
        body_id:        e.EventBodyId || null,
        event_date:     parseLegistarDate(e.EventDate),
        event_location: e.EventLocation || null,
        agenda_file:    e.EventAgendaFile || null,
        minutes_file:   e.EventMinutesFile || null,
        agenda_status:  e.EventAgendaStatusName || null,
        minutes_status: e.EventMinutesStatusName || null,
        last_seen:      now,
      });
      count++;
    }
    return count;
  });

  const count = ingestMany(events);
  console.log(`  ${label}: ingested ${count} of ${events.length} events`);
  return count;
}

// ── Ingest legislation ──

function ingestLegislation(db, matters) {
  if (!matters || matters.length === 0) {
    console.log(`  legislation: 0 matters, nothing to ingest`);
    return 0;
  }

  const now = new Date().toISOString();

  const upsert = db.prepare(`
    INSERT INTO legislation (
      matter_id, matter_type, title, sponsor, status,
      intro_date, passed_date, file_number, body_name, last_modified, last_seen
    ) VALUES (
      @matter_id, @matter_type, @title, @sponsor, @status,
      @intro_date, @passed_date, @file_number, @body_name, @last_modified, @last_seen
    )
    ON CONFLICT(matter_id) DO UPDATE SET
      matter_type   = excluded.matter_type,
      title         = excluded.title,
      sponsor       = excluded.sponsor,
      status        = excluded.status,
      intro_date    = excluded.intro_date,
      passed_date   = excluded.passed_date,
      file_number   = excluded.file_number,
      body_name     = excluded.body_name,
      last_modified = excluded.last_modified,
      last_seen     = excluded.last_seen
  `);

  const ingestMany = db.transaction((rows) => {
    let count = 0;
    for (const m of rows) {
      if (!m.MatterId) continue;
      upsert.run({
        matter_id:     m.MatterId,
        matter_type:   m.MatterTypeName || null,
        title:         m.MatterTitle || m.MatterName || null,
        sponsor:       m.MatterSponsorName || null,
        status:        m.MatterStatusName || null,
        intro_date:    parseLegistarDate(m.MatterIntroDate),
        passed_date:   parseLegistarDate(m.MatterPassedDate),
        file_number:   m.MatterFile || null,
        body_name:     m.MatterBodyName || null,
        last_modified: parseLegistarDate(m.MatterLastModifiedUtc),
        last_seen:     now,
      });
      count++;
    }
    return count;
  });

  const count = ingestMany(matters);
  console.log(`  legislation: ingested ${count} of ${matters.length} matters`);
  return count;
}

// ── Ingest policy flags ──

function ingestPolicyFlags(db, flagged) {
  if (!flagged || flagged.length === 0) {
    console.log(`  policy_flags: 0 flagged items`);
    return 0;
  }

  const now = new Date().toISOString();

  // Check for existing flags to avoid duplicates
  const existsCheck = db.prepare(`
    SELECT id FROM policy_flags WHERE source = ? AND source_id = ? AND flag_reason = ?
  `);

  const insert = db.prepare(`
    INSERT INTO policy_flags (source, source_id, flag_reason, flagged_at)
    VALUES (@source, @source_id, @flag_reason, @flagged_at)
  `);

  const ingestMany = db.transaction((rows) => {
    let inserted = 0;
    let skipped = 0;
    for (const f of rows) {
      for (const reason of f.flag_reasons || []) {
        const existing = existsCheck.get('legislation', f.matter_id, reason);
        if (existing) {
          skipped++;
          continue;
        }
        insert.run({
          source:     'legislation',
          source_id:  f.matter_id,
          flag_reason: reason,
          flagged_at: now,
        });
        inserted++;
      }
    }
    return { inserted, skipped };
  });

  const { inserted, skipped } = ingestMany(flagged);
  console.log(`  policy_flags: inserted ${inserted} new flags, skipped ${skipped} duplicates`);
  return inserted;
}

// ── Main ──

function main() {
  console.log('\n=== ingest-meetings.js ===\n');

  const db = getDb();

  // Load JSON files
  const upcoming = loadJson('meetings-upcoming.json');
  const recent = loadJson('meetings-recent.json');
  const legislation = loadJson('legislation-recent.json');
  const flagged = loadJson('legislation-flagged.json');

  console.log('Ingesting meetings...');
  const upcomingCount = ingestMeetings(db, upcoming, 'meetings-upcoming');
  const recentCount = ingestMeetings(db, recent, 'meetings-recent');

  console.log('\nIngesting legislation...');
  const legCount = ingestLegislation(db, legislation);

  console.log('\nIngesting policy flags...');
  const flagCount = ingestPolicyFlags(db, flagged);

  // Summary stats
  const totalMeetings = db.prepare('SELECT COUNT(*) AS n FROM civic_meetings').get().n;
  const totalLeg = db.prepare('SELECT COUNT(*) AS n FROM legislation').get().n;
  const totalFlags = db.prepare('SELECT COUNT(*) AS n FROM policy_flags').get().n;

  console.log('\n=== DB Summary ===');
  console.log(`  civic_meetings:  ${totalMeetings} total rows`);
  console.log(`  legislation:     ${totalLeg} total rows`);
  console.log(`  policy_flags:    ${totalFlags} total rows`);

  db.close();
  console.log('\nDone.');
}

main();
