/**
 * commitments-cli.js
 * CLI for managing the commitment tracker.
 *
 * Usage:
 *   node commitments-cli.js add            — add a new commitment
 *   node commitments-cli.js list           — list open (and recently closed) commitments
 *   node commitments-cli.js close <id>     — mark commitment resolved
 *   node commitments-cli.js all            — list all commitments including closed
 */

const readline = require('readline');
const { getDb } = require('./db');

const [,, command, ...args] = process.argv;

// --- helpers ---

function prompt(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function isOverdue(followUpDate) {
  if (!followUpDate) return false;
  return new Date(followUpDate) < new Date();
}

function formatDate(d) {
  if (!d) return '—';
  return d.slice(0, 10);
}

function pad(str, len) {
  return String(str || '').padEnd(len).slice(0, len);
}

// --- commands ---

async function cmdAdd(db) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n— Add Commitment —\n');
  const official_name   = await prompt(rl, 'Official name: ');
  const role            = await prompt(rl, 'Role/title: ');
  const meeting_date    = await prompt(rl, 'Meeting date (YYYY-MM-DD): ');
  const commitment_text = await prompt(rl, 'What did they commit to? ');
  const follow_up_date  = await prompt(rl, 'Follow-up date (YYYY-MM-DD): ');

  rl.close();

  if (!official_name.trim() || !commitment_text.trim()) {
    console.error('Error: official name and commitment text are required.');
    process.exit(1);
  }

  const stmt = db.prepare(`
    INSERT INTO commitments (official_name, role, meeting_date, commitment_text, follow_up_date)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    official_name.trim(),
    role.trim() || null,
    meeting_date.trim() || null,
    commitment_text.trim(),
    follow_up_date.trim() || null,
  );

  console.log(`\n✓ Commitment #${result.lastInsertRowid} saved.`);
}

function cmdList(db, showAll = false) {
  const where = showAll ? '' : "WHERE status = 'open'";
  const rows = db.prepare(`
    SELECT id, official_name, role, meeting_date, follow_up_date, status, commitment_text
    FROM commitments
    ${where}
    ORDER BY follow_up_date ASC, id ASC
  `).all();

  if (rows.length === 0) {
    console.log(showAll ? 'No commitments recorded yet.' : 'No open commitments. Run "node commitments-cli.js all" to see closed ones.');
    return;
  }

  console.log(`\n${'ID'.padEnd(4)} ${'Official'.padEnd(22)} ${'Meeting'.padEnd(12)} ${'Follow-up'.padEnd(12)} ${'Status'.padEnd(8)}  Commitment`);
  console.log('—'.repeat(100));

  for (const r of rows) {
    const overdue = r.status === 'open' && isOverdue(r.follow_up_date);
    const flag = overdue ? ' ⚠ OVERDUE' : '';
    const statusLabel = r.status === 'open' ? 'open' : 'closed';
    console.log(
      `${String(r.id).padEnd(4)} ${pad(r.official_name, 22)} ${pad(formatDate(r.meeting_date), 12)} ${pad(formatDate(r.follow_up_date), 12)} ${pad(statusLabel, 8)}  ${r.commitment_text.slice(0, 60)}${flag}`
    );
  }
  console.log(`\n${rows.length} record(s).`);
}

async function cmdClose(db, id) {
  if (!id) {
    console.error('Usage: node commitments-cli.js close <id>');
    process.exit(1);
  }

  const existing = db.prepare('SELECT * FROM commitments WHERE id = ?').get(id);
  if (!existing) {
    console.error(`Commitment #${id} not found.`);
    process.exit(1);
  }

  if (existing.status === 'closed') {
    console.log(`Commitment #${id} is already closed.`);
    return;
  }

  console.log(`\nClosing: "${existing.commitment_text}"`);
  console.log(`  Official: ${existing.official_name} | Meeting: ${formatDate(existing.meeting_date)}\n`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const outcome = await prompt(rl, 'Outcome notes (what actually happened): ');
  rl.close();

  db.prepare(`
    UPDATE commitments SET status = 'closed', outcome_notes = ? WHERE id = ?
  `).run(outcome.trim() || null, id);

  console.log(`✓ Commitment #${id} closed.`);
}

// --- main ---

async function main() {
  const db = getDb();

  switch (command) {
    case 'add':
      await cmdAdd(db);
      break;
    case 'list':
      cmdList(db, false);
      break;
    case 'all':
      cmdList(db, true);
      break;
    case 'close':
      await cmdClose(db, args[0]);
      break;
    default:
      console.log(`NeighborhoodOS Commitment Tracker

Usage:
  node commitments-cli.js add            Add a new commitment
  node commitments-cli.js list           List open commitments (flags overdue)
  node commitments-cli.js all            List all commitments
  node commitments-cli.js close <id>     Mark commitment resolved
`);
  }

  db.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
