/**
 * ask.js
 * Plain-English Q&A about the neighborhood via local Ollama.
 *
 * Usage:
 *   node ask.js "What are the most common complaints in Waldo?"
 *   node ask.js "Are there any overdue commitments from city officials?"
 *   node ask.js "How many open 311 requests are there?"
 */

const { getDb } = require('./db');

const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'gemma4:26b';
const FALLBACK_MODEL = 'gemma3:12b'; // fallback if primary not available

const question = process.argv.slice(2).join(' ').trim();

if (!question) {
  console.log(`Usage: node ask.js "Your question about the neighborhood"`);
  console.log(`Examples:`);
  console.log(`  node ask.js "What are the most common 311 complaints?"`);
  console.log(`  node ask.js "Which requests have been open the longest?"`);
  console.log(`  node ask.js "Do we have any overdue commitments from city officials?"`);
  process.exit(0);
}

// --- Build context from DB ---

function buildContext(db) {
  const sections = [];

  // Stats
  const total = db.prepare("SELECT COUNT(*) AS n FROM requests_311").get().n;
  // KC uses abbreviated codes: OPEN, ASSIG (open), RESOL, CANC, DUP (closed).
  const open  = db.prepare("SELECT COUNT(*) AS n FROM requests_311 WHERE status IN ('OPEN','ASSIG','Open','open','Assigned','assigned')").get().n;
  sections.push(`=== NEIGHBORHOOD STATS ===`);
  sections.push(`Total 311 requests on file: ${total}`);
  sections.push(`Currently open: ${open}`);
  sections.push('');

  // Top categories
  const cats = db.prepare(`
    SELECT category, COUNT(*) AS n
    FROM requests_311
    GROUP BY category
    ORDER BY n DESC
    LIMIT 15
  `).all();
  if (cats.length) {
    sections.push('=== TOP 311 CATEGORIES ===');
    for (const c of cats) {
      sections.push(`  ${c.n}x ${c.category || 'Unknown'}`);
    }
    sections.push('');
  }

  // Recent open requests
  const recent = db.prepare(`
    SELECT case_id, category, request_type, type, creation_date, street_address, status
    FROM requests_311
    WHERE status IN ('OPEN','ASSIG','Open','open','Assigned','assigned')
    ORDER BY creation_date DESC
    LIMIT 50
  `).all();
  if (recent.length) {
    sections.push('=== RECENT OPEN 311 REQUESTS (last 50) ===');
    for (const r of recent) {
      const label = r.category || r.request_type || r.type || 'Unknown';
      const days = r.creation_date
        ? Math.floor((Date.now() - new Date(r.creation_date)) / 86400000)
        : '?';
      sections.push(`  [${days}d ago] ${label} — ${r.street_address || 'Unknown address'} (${r.case_id})`);
    }
    sections.push('');
  }

  // Open commitments
  const today = new Date().toISOString().slice(0, 10);
  const commitments = db.prepare(`
    SELECT id, official_name, role, meeting_date, commitment_text, follow_up_date
    FROM commitments
    WHERE status = 'open'
    ORDER BY follow_up_date ASC
  `).all();
  if (commitments.length) {
    sections.push('=== OPEN COMMITMENTS FROM OFFICIALS ===');
    for (const c of commitments) {
      const overdueFlag = c.follow_up_date && c.follow_up_date < today ? ' [OVERDUE]' : '';
      sections.push(`  #${c.id} — ${c.official_name} (${c.role || 'unknown'})`);
      sections.push(`    Promised: ${c.commitment_text}`);
      sections.push(`    Follow-up due: ${c.follow_up_date || 'not set'}${overdueFlag}`);
    }
  } else {
    sections.push('=== OPEN COMMITMENTS ===\n  None recorded yet.');
  }
  sections.push('');

  // Recent permits
  try {
    const permits = db.prepare(`
      SELECT permit_no, permit_type, work_description, address, status, applied_date, estimated_value
      FROM permits
      ORDER BY applied_date DESC
      LIMIT 20
    `).all();
    const totalPermits = db.prepare('SELECT COUNT(*) AS n FROM permits').get().n;
    if (permits.length) {
      sections.push('=== RECENT BUILDING PERMITS (last 20) ===');
      sections.push(`Total permits on file: ${totalPermits}`);
      for (const p of permits) {
        const val = p.estimated_value ? ` [$${Number(p.estimated_value).toLocaleString()}]` : '';
        sections.push(`  [${p.applied_date ? p.applied_date.slice(0,10) : '?'}] ${p.permit_type || 'Unknown type'} — ${p.address || '?'}${val} (${p.status || '?'})`);
        if (p.work_description) sections.push(`    ${p.work_description.slice(0, 100)}`);
      }
      sections.push('');
    }
  } catch { /* table not yet created */ }

  // Violations summary
  try {
    const violCount = db.prepare(`SELECT COUNT(*) AS n FROM property_violations`).get().n;
    const openViol = db.prepare(`
      SELECT violation_code, COUNT(*) AS n
      FROM property_violations
      WHERE status NOT IN ('Closed','closed','CLOSED','Resolved','resolved') OR status IS NULL
      GROUP BY violation_code
      ORDER BY n DESC
      LIMIT 10
    `).all();
    if (violCount > 0) {
      sections.push(`=== PROPERTY VIOLATIONS ===`);
      sections.push(`Total violations on file: ${violCount}`);
      if (openViol.length) {
        sections.push('Top open violation types:');
        for (const v of openViol) {
          sections.push(`  ${v.n}x ${v.violation_code || 'Unknown code'}`);
        }
      }
      sections.push('');
    }
  } catch { /* table not yet created */ }

  // Dangerous buildings
  try {
    const dbCount = db.prepare('SELECT COUNT(*) AS n FROM dangerous_buildings').get().n;
    if (dbCount > 0) {
      const openBuildings = db.prepare(`
        SELECT address, status, case_opened
        FROM dangerous_buildings
        WHERE status NOT LIKE '%close%' AND status NOT LIKE '%demolish%'
        ORDER BY case_opened DESC
        LIMIT 10
      `).all();
      sections.push(`=== DANGEROUS / UNSAFE BUILDINGS ===`);
      sections.push(`Total cases on file: ${dbCount}, Active (not closed): ${openBuildings.length}`);
      for (const b of openBuildings) {
        sections.push(`  [${b.case_opened ? b.case_opened.slice(0,10) : '?'}] ${b.address || '?'} — ${b.status || '?'}`);
      }
      sections.push('');
    }
  } catch { /* table not yet created */ }

  // Budget summary
  try {
    const budgetSummary = db.prepare(`
      SELECT department, budget_type, SUM(amount) AS total
      FROM budget
      WHERE lower(department) LIKE '%park%'
         OR lower(department) LIKE '%public work%'
         OR lower(department) LIKE '%nhs%'
      GROUP BY department, budget_type
      ORDER BY total DESC
    `).all();
    if (budgetSummary.length) {
      sections.push('=== BUDGET SUMMARY (Parks + Public Works) ===');
      for (const row of budgetSummary) {
        sections.push(`  ${row.department} (${row.budget_type}): $${Math.round(row.total).toLocaleString()}`);
      }
      sections.push('');
    }
  } catch { /* table not yet created */ }

  return sections.join('\n');
}

// --- Check Ollama + pick model ---

async function checkOllama() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const names = (data.models || []).map(m => m.name);
    if (names.some(n => n.startsWith('gemma4'))) return MODEL;
    if (names.some(n => n.startsWith('gemma3'))) return FALLBACK_MODEL;
    if (names.length) return names[0]; // use whatever's there
    return null;
  } catch {
    return null;
  }
}

async function askOllama(model, context, question) {
  const systemPrompt = `You are a neighborhood civic assistant for West Waldo, Kansas City, Missouri.
You help residents understand what's happening in their neighborhood based on city data.
Answer clearly and specifically. Cite numbers when available. Be direct and useful.
If the data doesn't cover something, say so honestly.`;

  const userMessage = `Here is current neighborhood data:\n\n${context}\n\n---\n\nResident question: ${question}`;

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: true,
    }),
    signal: AbortSignal.timeout(120000), // 2 min timeout
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Ollama responded ${res.status}: ${err}`);
  }

  // Stream the response
  process.stdout.write(`\n🪱 Larry (${model}):\n\n`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        const token = obj.message?.content || '';
        if (token) process.stdout.write(token);
        if (obj.done) {
          process.stdout.write('\n\n');
          return;
        }
      } catch {
        // Non-JSON line, skip
      }
    }
  }
  process.stdout.write('\n');
}

// --- Main ---

async function main() {
  const db = getDb();
  const context = buildContext(db);
  db.close();

  console.log(`Question: ${question}\n`);

  const model = await checkOllama();
  if (!model) {
    console.error('Ollama is not running or no models are available.');
    console.error(`Start Ollama and ensure a model is pulled (e.g., "ollama pull gemma3:12b")`);
    console.error('');
    console.error('--- Neighborhood context that would have been used ---');
    console.log(context);
    process.exit(1);
  }

  await askOllama(model, context, question);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
