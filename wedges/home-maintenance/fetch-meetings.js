/**
 * fetch-meetings.js
 * Fetches civic meetings and legislation from the Legistar Web API for Kansas City.
 *
 * Saves to data/:
 *   meetings-upcoming.json  — events in the next 60 days
 *   meetings-recent.json    — events from the last 90 days
 *   legislation-recent.json — matters modified in the last 180 days
 *   legislation-flagged.json — matters matching Waldo/neighborhood keywords
 *
 * Usage: node fetch-meetings.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://webapi.legistar.com/v1/kansascity';
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Date helpers ──

function isoDate(d) {
  return d.toISOString().split('T')[0];
}

function legistarDate(d) {
  // OData filter format required by Legistar
  return `datetime'${d.toISOString().replace(/\.\d+Z$/, '')}'`;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ── Fetch with pagination ──

async function fetchAll(url, label, topPerPage = 200) {
  const results = [];
  let skip = 0;

  while (true) {
    const sep = url.includes('?') ? '&' : '?';
    const pageUrl = `${url}${sep}$top=${topPerPage}&$skip=${skip}`;
    process.stdout.write(`  Fetching ${label} (skip=${skip})... `);

    const res = await fetch(pageUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => res.statusText);
      throw new Error(`HTTP ${res.status} for ${label}: ${body.slice(0, 200)}`);
    }

    const page = await res.json();
    if (!Array.isArray(page) || page.length === 0) {
      console.log(`done (${results.length} total)`);
      break;
    }

    results.push(...page);
    console.log(`got ${page.length} (running total: ${results.length})`);

    if (page.length < topPerPage) break; // last page
    skip += topPerPage;

    // Safety cap at 5000 results
    if (results.length >= 5000) {
      console.log(`  [cap reached at 5000, stopping pagination]`);
      break;
    }
  }

  return results;
}

// ── Keyword flagging ──

const GEO_KEYWORDS = [
  'waldo', 'ward 6', '75th', '76th', '77th', '78th', '79th',
  '80th', '81st', '82nd', '83rd', '84th', '85th',
  'wornall', 'brookside', 'holmes', 'state line',
];

const TOPIC_KEYWORDS = [
  'zoning', 'rezoning', 'demolition', 'variance', 'tif',
  'tax increment', 'capital improvement', 'streetscape',
  'traffic', 'park', 'affordable housing',
];

const ALL_KEYWORDS = [...GEO_KEYWORDS, ...TOPIC_KEYWORDS];

function flagMatter(matter) {
  const haystack = [
    matter.MatterTitle || '',
    matter.MatterName || '',
    matter.MatterSponsorName || '',
    matter.MatterBodyName || '',
  ].join(' ').toLowerCase();

  const matched = ALL_KEYWORDS.filter(kw => haystack.includes(kw.toLowerCase()));
  if (matched.length === 0) return null;

  return {
    matter_id: matter.MatterId,
    matter_type: matter.MatterTypeName,
    title: matter.MatterTitle || matter.MatterName || '',
    sponsor: matter.MatterSponsorName || '',
    status: matter.MatterStatusName || '',
    file_number: matter.MatterFile || '',
    intro_date: matter.MatterIntroDate
      ? new Date(matter.MatterIntroDate).toISOString().split('T')[0]
      : null,
    flag_reasons: matched,
  };
}

// ── Main ──

async function main() {
  const now = new Date();
  const upcoming60 = daysFromNow(60);
  const past90 = daysAgo(90);
  const past180 = daysAgo(180);

  console.log('\n=== fetch-meetings.js ===');
  console.log(`Fetching data from Legistar Web API (Kansas City)`);
  console.log(`Now: ${isoDate(now)}\n`);

  // ── a) Upcoming meetings ──
  console.log('📅 Upcoming meetings (next 60 days)...');
  const upcomingFilter = `EventDate ge ${legistarDate(now)} and EventDate le ${legistarDate(upcoming60)}`;
  const upcomingUrl = `${BASE_URL}/events?$filter=${encodeURIComponent(upcomingFilter)}&$orderby=EventDate asc`;

  const upcomingMeetings = await fetchAll(upcomingUrl, 'upcoming meetings', 100);
  const upcomingPath = path.join(DATA_DIR, 'meetings-upcoming.json');
  fs.writeFileSync(upcomingPath, JSON.stringify(upcomingMeetings, null, 2));
  console.log(`  → Saved ${upcomingMeetings.length} upcoming meetings to data/meetings-upcoming.json\n`);

  // ── b) Recent past meetings ──
  console.log('📅 Recent past meetings (last 90 days)...');
  const recentFilter = `EventDate ge ${legistarDate(past90)} and EventDate lt ${legistarDate(now)}`;
  const recentUrl = `${BASE_URL}/events?$filter=${encodeURIComponent(recentFilter)}&$orderby=EventDate desc`;

  const recentMeetings = await fetchAll(recentUrl, 'recent meetings', 200);
  const recentPath = path.join(DATA_DIR, 'meetings-recent.json');
  fs.writeFileSync(recentPath, JSON.stringify(recentMeetings, null, 2));
  console.log(`  → Saved ${recentMeetings.length} recent meetings to data/meetings-recent.json\n`);

  // ── c) Recent legislation ──
  console.log('📜 Recent legislation (last 180 days)...');
  const legislationFilter = `MatterLastModifiedUtc ge ${legistarDate(past180)}`;
  const legislationUrl = `${BASE_URL}/matters?$filter=${encodeURIComponent(legislationFilter)}&$orderby=MatterLastModifiedUtc desc`;

  const legislation = await fetchAll(legislationUrl, 'legislation', 200);
  const legislationPath = path.join(DATA_DIR, 'legislation-recent.json');
  fs.writeFileSync(legislationPath, JSON.stringify(legislation, null, 2));
  console.log(`  → Saved ${legislation.length} legislation items to data/legislation-recent.json\n`);

  // ── d) Flag Waldo-relevant legislation ──
  console.log('🔍 Scanning for Waldo/neighborhood-relevant legislation...');
  const flagged = [];
  for (const matter of legislation) {
    const flag = flagMatter(matter);
    if (flag) flagged.push(flag);
  }
  const flaggedPath = path.join(DATA_DIR, 'legislation-flagged.json');
  fs.writeFileSync(flaggedPath, JSON.stringify(flagged, null, 2));
  console.log(`  → Found ${flagged.length} flagged items, saved to data/legislation-flagged.json`);

  if (flagged.length > 0) {
    console.log('\n  Flagged items:');
    for (const f of flagged.slice(0, 20)) {
      const title = (f.title || '').slice(0, 80);
      console.log(`    [${f.matter_type || '?'}] ${title}`);
      console.log(`      Matched: ${f.flag_reasons.join(', ')}`);
    }
    if (flagged.length > 20) console.log(`    ... and ${flagged.length - 20} more`);
  }

  // ── Summary ──
  console.log('\n=== Summary ===');
  console.log(`  Upcoming meetings (next 60d): ${upcomingMeetings.length}`);
  console.log(`  Recent meetings (last 90d):   ${recentMeetings.length}`);
  console.log(`  Recent legislation (180d):    ${legislation.length}`);
  console.log(`  Flagged for Waldo/area:       ${flagged.length}`);
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
