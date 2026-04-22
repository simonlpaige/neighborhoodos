// One-off: purge tables we're re-ingesting from scratch, because earlier runs
// used unfiltered/wrong-id schemes. Crime is scoped to West Waldo going forward.
const { getDb } = require('./db');
const db = getDb();

const before = {
  crime: db.prepare('SELECT COUNT(*) AS n FROM crime').get().n,
  budget: db.prepare('SELECT COUNT(*) AS n FROM budget').get().n,
  vendor_payments: db.prepare('SELECT COUNT(*) AS n FROM vendor_payments').get().n,
  permits: db.prepare('SELECT COUNT(*) AS n FROM permits').get().n,
};

// Delete crime rows outside West Waldo (keeps the ones that are in-bounds).
const crimeDelete = db.prepare(`
  DELETE FROM crime
  WHERE lat IS NULL
     OR lat NOT BETWEEN 38.97 AND 38.99
     OR lon NOT BETWEEN -94.60 AND -94.57
`).run();

// Nuke these tables entirely so we re-ingest cleanly with correct IDs.
db.exec(`DELETE FROM budget`);
db.exec(`DELETE FROM vendor_payments`);
db.exec(`DELETE FROM permits`);

const after = {
  crime: db.prepare('SELECT COUNT(*) AS n FROM crime').get().n,
  budget: db.prepare('SELECT COUNT(*) AS n FROM budget').get().n,
  vendor_payments: db.prepare('SELECT COUNT(*) AS n FROM vendor_payments').get().n,
  permits: db.prepare('SELECT COUNT(*) AS n FROM permits').get().n,
};

console.log('Purged stale rows.');
console.log('  crime: ', before.crime, '→', after.crime, `(deleted ${crimeDelete.changes} outside West Waldo)`);
console.log('  budget:', before.budget, '→', after.budget);
console.log('  vendor_payments:', before.vendor_payments, '→', after.vendor_payments);
console.log('  permits:', before.permits, '→', after.permits);

db.close();
