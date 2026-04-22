/**
 * build-frontend.js
 * Generates a static HTML dashboard for NeighborhoodOS from the SQLite DB.
 * Output: public/index.html
 * Run: node build-frontend.js
 */

const Database = require('./node_modules/better-sqlite3');
process.chdir(__dirname);
const fs = require('fs');
const path = require('path');

const db = new Database('./data/neighborhood-os.db');
const outDir = path.join(__dirname, 'public');
fs.mkdirSync(outDir, { recursive: true });

// ── Pull data ──────────────────────────────────────────────────────────────

const total311 = db.prepare("SELECT COUNT(*) as c FROM requests_311").get().c;
const open311 = db.prepare("SELECT COUNT(*) as c FROM requests_311 WHERE status NOT LIKE '%RESOL%' AND status NOT LIKE '%Closed%'").get().c;
const oldest311 = db.prepare("SELECT MIN(creation_date) as d FROM requests_311 WHERE status NOT LIKE '%RESOL%'").get().d;
const oldestDays = oldest311 ? Math.floor((Date.now() - new Date(oldest311)) / 86400000) : 0;

const topTypes = db.prepare(`
  SELECT request_type, COUNT(*) as c
  FROM requests_311
  GROUP BY request_type ORDER BY c DESC LIMIT 8
`).all();

const recentOpen = db.prepare(`
  SELECT request_type, street_address, creation_date
  FROM requests_311
  WHERE status NOT LIKE '%RESOL%' AND status NOT LIKE '%Closed%'
  ORDER BY creation_date DESC LIMIT 10
`).all();

const oldestOpen = db.prepare(`
  SELECT request_type, street_address, creation_date, status
  FROM requests_311
  WHERE creation_date IS NOT NULL
  ORDER BY creation_date ASC LIMIT 5
`).all();

const crimeTotal = db.prepare("SELECT COUNT(*) as c FROM crime").get().c;
const crimeByType = db.prepare(`
  SELECT offense, COUNT(*) as c FROM crime
  GROUP BY offense ORDER BY c DESC LIMIT 6
`).all();

const violations = db.prepare("SELECT COUNT(*) as c FROM property_violations").get().c;
const openViolations = db.prepare("SELECT COUNT(*) as c FROM property_violations WHERE status NOT LIKE '%Closed%'").get().c;
const dangerousBuildings = db.prepare("SELECT COUNT(*) as c FROM dangerous_buildings").get().c;

const upcomingMeetings = db.prepare(`
  SELECT event_date, body_name, event_location
  FROM civic_meetings
  WHERE event_date >= date('now')
  ORDER BY event_date ASC LIMIT 5
`).all();

const recentLegislation = db.prepare(`
  SELECT title, status, last_modified, matter_type, intro_date
  FROM legislation
  ORDER BY last_modified DESC LIMIT 8
`).all();

const policyFlags = db.prepare(`
  SELECT pf.id, l.title, pf.flag_reason, l.matter_type
  FROM policy_flags pf
  LEFT JOIN legislation l ON pf.source_id = l.matter_id
  ORDER BY pf.flagged_at DESC LIMIT 6
`).all();

const commitments = db.prepare("SELECT * FROM commitments ORDER BY follow_up_date ASC").all();
const openCommitments = commitments.filter(c => c.status === 'open');

const now = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const genTime = new Date().toISOString();

// ── Helper ─────────────────────────────────────────────────────────────────

function fmt(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d.slice(0, 10); }
}

function truncate(s, n = 55) {
  if (!s) return '—';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function barWidth(val, max) {
  return Math.max(4, Math.round((val / max) * 100));
}

// ── HTML ───────────────────────────────────────────────────────────────────

const topMax = topTypes[0]?.c || 1;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NeighborhoodOS — West Waldo, KC</title>
<meta name="description" content="Civic intelligence dashboard for West Waldo, Kansas City. 311 data, crime trends, city meetings, and commitment tracking.">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0d1117; --surface: #161b22; --s2: #1c2128;
  --border: #30363d; --text: #c9d1d9; --muted: #8b949e;
  --dim: #484f58; --accent: #58a6ff; --green: #3fb950;
  --yellow: #d29922; --red: #f85149; --teal: #39d353;
  --warm: #e3b341;
}
html { scroll-behavior: smooth; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg); color: var(--text); font-size: 14px; line-height: 1.6; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(13,17,23,0.95); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0 24px; height: 50px;
  display: flex; align-items: center; justify-content: space-between;
}
.nav-brand { font-weight: 800; font-size: 15px; color: var(--teal); letter-spacing: -0.01em; }
.nav-sub { font-size: 12px; color: var(--muted); margin-left: 10px; }
.nav-links { display: flex; gap: 4px; }
.nav-links a { padding: 4px 10px; border-radius: 6px; font-size: 12px; color: var(--muted); }
.nav-links a:hover { background: var(--s2); color: var(--text); text-decoration: none; }

.wrap { max-width: 1100px; margin: 0 auto; padding: 32px 20px 80px; }

.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 22px; font-weight: 700; color: #e6edf3; }
.page-header p { font-size: 13px; color: var(--muted); margin-top: 4px; }

/* STAT CARDS */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 32px; }
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 16px 18px;
}
.stat-n { font-size: 28px; font-weight: 800; line-height: 1; letter-spacing: -0.02em; }
.stat-n.green { color: var(--green); }
.stat-n.yellow { color: var(--yellow); }
.stat-n.red { color: var(--red); }
.stat-n.blue { color: var(--accent); }
.stat-l { font-size: 11px; color: var(--muted); margin-top: 5px; text-transform: uppercase; letter-spacing: 0.05em; }

/* SECTION */
.section { margin-bottom: 36px; }
.section-hd {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--teal); margin-bottom: 12px; padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 680px) { .two-col { grid-template-columns: 1fr; } }

/* TABLE */
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { text-align: left; padding: 6px 10px; font-size: 11px; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
.data-table td { padding: 7px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--s2); }

/* BAR CHART */
.bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; font-size: 12px; }
.bar-label { width: 220px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 0; }
.bar-track { flex: 1; height: 8px; background: var(--s2); border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.3s; }
.bar-val { width: 50px; text-align: right; color: var(--muted); font-variant-numeric: tabular-nums; }

/* BADGE */
.badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-open { background: rgba(248,81,73,0.15); color: var(--red); }
.badge-closed { background: rgba(63,185,80,0.15); color: var(--green); }
.badge-pending { background: rgba(210,153,34,0.15); color: var(--yellow); }

/* MEETINGS */
.meeting-item { padding: 10px 14px; background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; margin-bottom: 8px; }
.meeting-date { font-size: 11px; color: var(--teal); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.meeting-body { font-size: 13px; color: var(--text); margin-top: 2px; font-weight: 500; }
.meeting-loc { font-size: 12px; color: var(--muted); margin-top: 2px; }

/* COMMITMENT */
.commitment-empty { padding: 20px; text-align: center; color: var(--muted); font-size: 13px;
  background: var(--surface); border: 1px dashed var(--border); border-radius: 8px; }

/* POLICY */
.policy-item { padding: 10px 14px; background: var(--surface); border-left: 3px solid var(--yellow);
  border-radius: 0 8px 8px 0; margin-bottom: 8px; }
.policy-title { font-size: 13px; font-weight: 500; color: var(--text); }
.policy-flag { font-size: 11px; color: var(--yellow); margin-top: 3px; }

/* SIMILAR PROJECTS */
.project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.project-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
  padding: 14px 16px; }
.project-name { font-weight: 600; font-size: 13px; color: var(--accent); }
.project-desc { font-size: 12px; color: var(--muted); margin-top: 4px; line-height: 1.5; }
.project-tag { display: inline-block; margin-top: 8px; padding: 2px 8px; border-radius: 20px;
  font-size: 10px; background: var(--s2); color: var(--dim); border: 1px solid var(--border); }

footer { border-top: 1px solid var(--border); padding: 20px 24px; text-align: center;
  font-size: 12px; color: var(--muted); }
</style>
</head>
<body>

<nav>
  <div style="display:flex;align-items:center;">
    <span class="nav-brand">NeighborhoodOS</span>
    <span class="nav-sub">West Waldo · Kansas City</span>
  </div>
  <div class="nav-links">
    <a href="#311">311</a>
    <a href="#crime">Crime</a>
    <a href="#meetings">Meetings</a>
    <a href="#legislation">Legislation</a>
    <a href="#commitments">Commitments</a>
    <a href="#network">Network</a>
    <a href="https://github.com/simonlpaige/neighborhoodos" target="_blank" rel="noopener">Source ↗</a>
  </div>
</nav>

<div class="wrap">

<div class="page-header">
  <h1>West Waldo Neighborhood Intelligence</h1>
  <p>Live civic data from KC Open Data · Updated ${now} · Part of <a href="https://commonweave.earth/">Commonweave</a></p>
</div>

<!-- STATS ROW -->
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-n blue">${total311.toLocaleString()}</div>
    <div class="stat-l">311 Requests (all time)</div>
  </div>
  <div class="stat-card">
    <div class="stat-n yellow">${open311.toLocaleString()}</div>
    <div class="stat-l">Open / Unresolved</div>
  </div>
  <div class="stat-card">
    <div class="stat-n red">${oldestDays.toLocaleString()}</div>
    <div class="stat-l">Days — Oldest Open</div>
  </div>
  <div class="stat-card">
    <div class="stat-n blue">${crimeTotal.toLocaleString()}</div>
    <div class="stat-l">Crime Reports</div>
  </div>
  <div class="stat-card">
    <div class="stat-n red">${openViolations}</div>
    <div class="stat-l">Open Violations</div>
  </div>
  <div class="stat-card">
    <div class="stat-n red">${dangerousBuildings}</div>
    <div class="stat-l">Dangerous Buildings</div>
  </div>
  <div class="stat-card">
    <div class="stat-n blue">${upcomingMeetings.length}</div>
    <div class="stat-l">Upcoming Meetings</div>
  </div>
  <div class="stat-card">
    <div class="stat-n ${openCommitments.length > 0 ? 'yellow' : 'green'}">${openCommitments.length}</div>
    <div class="stat-l">Open Commitments</div>
  </div>
</div>

<!-- 311 -->
<div id="311" class="section">
  <div class="section-hd">311 Service Requests</div>
  <div class="two-col">
    <div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px;">Top request types (all time)</div>
      ${topTypes.map(r => `
      <div class="bar-row">
        <div class="bar-label">${truncate(r.request_type, 30)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${barWidth(r.c, topMax)}%"></div></div>
        <div class="bar-val">${r.c.toLocaleString()}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px;">Oldest open requests</div>
      <table class="data-table">
        <thead><tr><th>Type</th><th>Address</th><th>Opened</th></tr></thead>
        <tbody>
          ${oldestOpen.map(r => `
          <tr>
            <td>${truncate(r.request_type, 28)}</td>
            <td style="color:var(--muted)">${truncate(r.street_address || '—', 22)}</td>
            <td style="color:var(--red);white-space:nowrap">${fmt(r.creation_date)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- CRIME -->
<div id="crime" class="section">
  <div class="section-hd">Crime Reports</div>
  <div class="two-col">
    <div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px;">By offense category</div>
      ${crimeByType.map(r => `
      <div class="bar-row">
        <div class="bar-label">${r.offense || 'Unknown'}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${barWidth(r.c, crimeByType[0].c)}%;background:var(--red)"></div></div>
        <div class="bar-val">${r.c.toLocaleString()}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px;">Property violations</div>
      <div class="stat-card" style="margin-bottom:10px;">
        <div class="stat-n red">${openViolations}</div>
        <div class="stat-l">Open violations</div>
      </div>
      <div class="stat-card">
        <div class="stat-n red">${dangerousBuildings}</div>
        <div class="stat-l">Dangerous buildings flagged</div>
      </div>
    </div>
  </div>
</div>

<!-- MEETINGS -->
<div id="meetings" class="section">
  <div class="section-hd">Upcoming City Meetings</div>
  ${upcomingMeetings.length === 0
    ? '<p style="color:var(--muted);font-size:13px;">No upcoming meetings found in the next 14 days.</p>'
    : upcomingMeetings.map(m => `
  <div class="meeting-item">
    <div class="meeting-date">${fmt(m.event_date)}</div>
    <div class="meeting-body">${m.body_name || 'City Meeting'}</div>
    ${m.event_location ? `<div class="meeting-loc">📍 ${m.event_location}</div>` : ''}
  </div>`).join('')}
</div>

<!-- LEGISLATION -->
<div id="legislation" class="section">
  <div class="section-hd">Recent Legislation & Flagged Items</div>
  <div class="two-col">
    <div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:10px;">Recent council actions</div>
      <table class="data-table">
        <thead><tr><th>Title</th><th>Type</th><th>Last Action</th></tr></thead>
        <tbody>
          ${recentLegislation.map(r => `
          <tr>
            <td>${truncate(r.title, 38)}</td>
            <td style="color:var(--muted)">${r.matter_type || '—'}</td>
            <td style="white-space:nowrap;color:var(--muted)">${fmt(r.last_modified || r.intro_date)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:10px;">Policy flags</div>
      ${policyFlags.length === 0
        ? '<p style="color:var(--muted);font-size:13px;">No flagged items.</p>'
        : policyFlags.map(p => `
      <div class="policy-item">
        <div class="policy-title">${truncate(p.title || p.flag_reason || 'Flagged item', 50)}</div>
        <div class="policy-flag">⚑ ${p.flag_reason || p.matter_type || 'Flagged for review'}</div>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- COMMITMENTS -->
<div id="commitments" class="section">
  <div class="section-hd">City Official Commitments</div>
  ${openCommitments.length === 0
    ? `<div class="commitment-empty">
        <strong>No commitments tracked yet.</strong><br>
        Add one with: <code>node commitments-cli.js add</code>
       </div>`
    : `<table class="data-table">
        <thead><tr><th>Official</th><th>Commitment</th><th>Meeting</th><th>Follow-up</th><th>Status</th></tr></thead>
        <tbody>
          ${openCommitments.map(c => `
          <tr>
            <td>${c.official_name}</td>
            <td>${truncate(c.commitment_text, 50)}</td>
            <td>${fmt(c.meeting_date)}</td>
            <td style="color:var(--yellow)">${fmt(c.follow_up_date)}</td>
            <td><span class="badge badge-open">Open</span></td>
          </tr>`).join('')}
        </tbody>
       </table>`}
</div>

<!-- SIMILAR PROJECTS / NETWORK -->
<div id="network" class="section">
  <div class="section-hd">Similar Projects & Network</div>
  <p style="font-size:13px;color:var(--muted);margin-bottom:16px;">
    NeighborhoodOS is part of a growing ecosystem of resident-controlled civic intelligence tools.
    These projects share data formats, lessons, or design philosophy.
  </p>
  <div class="project-grid">
    <div class="project-card">
      <div class="project-name"><a href="https://github.com/hackforla/311-data" target="_blank" rel="noopener">311-Data (Hack for LA)</a></div>
      <div class="project-desc">Empowers LA neighborhood councils with 311 data analysis. Closest prior art — same data, different city.</div>
      <span class="project-tag">311 · LA · React</span>
    </div>
    <div class="project-card">
      <div class="project-name"><a href="https://github.com/chicago-justice-project/chicago-justice" target="_blank" rel="noopener">Chicago Justice Project</a></div>
      <div class="project-desc">Tracks crime and police accountability data in Chicago. Commitment tracker inspiration.</div>
      <span class="project-tag">Crime · Accountability · Chicago</span>
    </div>
    <div class="project-card">
      <div class="project-name"><a href="https://github.com/datamade/councilmatic" target="_blank" rel="noopener">Councilmatic</a></div>
      <div class="project-desc">Makes city council legislation legible. Used in NYC, Chicago, LA. Powers our legislation layer.</div>
      <span class="project-tag">Legislation · Legistar · Python</span>
    </div>
    <div class="project-card">
      <div class="project-name"><a href="https://decidim.org" target="_blank" rel="noopener">Decidim</a></div>
      <div class="project-desc">Open-source participatory democracy platform. Barcelona origin. Deployed by cities worldwide. Governance model inspiration.</div>
      <span class="project-tag">Participation · Federation · Ruby</span>
    </div>
    <div class="project-card">
      <div class="project-name"><a href="https://www.mysociety.org/projects/alaveteli/" target="_blank" rel="noopener">Alaveteli (mySociety)</a></div>
      <div class="project-desc">FOI request platform deployed in 25+ countries. Adversarial relationship with institutions — same design philosophy.</div>
      <span class="project-tag">FOI · Transparency · UK</span>
    </div>
    <div class="project-card">
      <div class="project-name"><a href="https://www.open311.org" target="_blank" rel="noopener">Open311</a></div>
      <div class="project-desc">Open standard for 311 service request APIs. The protocol our data pipeline is built on.</div>
      <span class="project-tag">Standard · API · Open Data</span>
    </div>
    <div class="project-card">
      <div class="project-name"><a href="https://commonweave.earth/" target="_blank" rel="noopener">Commonweave</a></div>
      <div class="project-desc">The framework NeighborhoodOS is built inside. Maps 24,500+ aligned orgs across 61 countries. NeighborhoodOS is the Mycelial Strategy at neighborhood scale.</div>
      <span class="project-tag">Framework · KC · Open Source</span>
    </div>
    <div class="project-card">
      <div class="project-name"><a href="https://waldonet.simonlpaige.com" target="_blank" rel="noopener">WaldoNet</a></div>
      <div class="project-desc">KC community AI readiness program. NeighborhoodOS runs on WaldoNet infrastructure, starting with West Waldo as the pilot.</div>
      <span class="project-tag">WaldoNet · Pilot · KC</span>
    </div>
  </div>
</div>

</div><!-- /wrap -->

<footer>
  NeighborhoodOS · West Waldo, Kansas City · Data from <a href="https://data.kcmo.org" target="_blank" rel="noopener">KC Open Data</a> ·
  Part of <a href="https://commonweave.earth/">Commonweave</a> ·
  <a href="https://github.com/simonlpaige/neighborhoodos" target="_blank" rel="noopener">Open Source</a> ·
  Generated ${genTime.slice(0,10)}
</footer>

</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
console.log(`Built: public/index.html (${(html.length/1024).toFixed(1)}KB)`);
console.log(`Stats: ${total311.toLocaleString()} 311 requests, ${crimeTotal.toLocaleString()} crime reports, ${upcomingMeetings.length} upcoming meetings, ${policyFlags.length} policy flags`);

