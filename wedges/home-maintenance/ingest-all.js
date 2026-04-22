/**
 * ingest-all.js
 * Reads all raw JSON files from data/ and upserts into their respective DB tables.
 * Run after fetch-all.js.
 *
 * Reports per table: new, updated, total.
 */

const fs   = require('fs');
const path = require('path');
const { getDb } = require('./db');

const DATA_DIR = path.join(__dirname, 'data');
const now = new Date().toISOString();

// ─── Coordinate extraction helpers ───────────────────────────────────────────

function extractCoords(obj) {
  if (!obj) return { lat: null, lon: null };

  // Socrata Point type: { type: 'Point', coordinates: [lon, lat] }
  if (obj.type === 'Point' && Array.isArray(obj.coordinates)) {
    return { lon: parseFloat(obj.coordinates[0]), lat: parseFloat(obj.coordinates[1]) };
  }

  // Socrata location type: { latitude: '38.97...', longitude: '-94.5...' }
  if (obj.latitude != null) {
    return { lat: parseFloat(obj.latitude), lon: parseFloat(obj.longitude) };
  }

  // human_address wrapper
  if (obj.human_address && (obj.latitude != null || obj.coordinates)) {
    return extractCoords({ latitude: obj.latitude, longitude: obj.longitude });
  }

  return { lat: null, lon: null };
}

function coordsFromRecord(raw, ...fieldNames) {
  for (const field of fieldNames) {
    if (raw[field]) {
      const c = extractCoords(raw[field]);
      if (c.lat != null) return c;
    }
  }
  // Top-level lat/lon columns
  if (raw.latitude != null) return { lat: parseFloat(raw.latitude), lon: parseFloat(raw.longitude) };
  if (raw.lat != null) return { lat: parseFloat(raw.lat), lon: parseFloat(raw.lon) };
  return { lat: null, lon: null };
}

// ─── Generic upsert runner ────────────────────────────────────────────────────

function runUpserts(db, rows, existsFn, insertStmt, updateStmt) {
  let newCount = 0, updatedCount = 0, skipped = 0;

  const upsertAll = db.transaction(() => {
    for (const row of rows) {
      if (!row) { skipped++; continue; }
      const existing = existsFn(row);
      if (!existing) {
        try { insertStmt.run(row); newCount++; }
        catch (e) { skipped++; }
      } else {
        try { updateStmt.run(row); updatedCount++; }
        catch (e) { skipped++; }
      }
    }
  });

  upsertAll();
  return { newCount, updatedCount, skipped };
}

// ─── Permits ──────────────────────────────────────────────────────────────────

function ingestPermits(db) {
  const filePath = path.join(DATA_DIR, 'permits-raw.json');
  if (!fs.existsSync(filePath)) { console.log('  permits-raw.json not found, skipping.'); return; }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!raw.length) { console.log('  No permit records.'); return; }

  const existsStmt = db.prepare('SELECT permit_no FROM permits WHERE permit_no = ?');
  const insertStmt = db.prepare(`
    INSERT INTO permits (permit_no, permit_type, work_description, address, neighborhood, status,
      applied_date, issued_date, finaled_date, estimated_value, contractor, lat, lon, last_seen)
    VALUES (@permit_no, @permit_type, @work_description, @address, @neighborhood, @status,
      @applied_date, @issued_date, @finaled_date, @estimated_value, @contractor, @lat, @lon, @last_seen)
  `);
  const updateStmt = db.prepare(`
    UPDATE permits SET permit_type=@permit_type, work_description=@work_description,
      address=@address, neighborhood=@neighborhood, status=@status, applied_date=@applied_date,
      issued_date=@issued_date, finaled_date=@finaled_date, estimated_value=@estimated_value,
      contractor=@contractor, lat=@lat, lon=@lon, last_seen=@last_seen
    WHERE permit_no=@permit_no
  `);

  const rows = raw.map(r => {
    // Real schema: latitude/longitude as top-level numeric columns (no Point field).
    const { lat, lon } = coordsFromRecord(r, 'mapped_location', 'location');
    const permit_no = r.permitnum || r.permit_no || r.permitno || r.id;
    if (!permit_no) return null;
    // Compose address from originaladdress1 + city/state/zip when present.
    const address = r.originaladdress1
      ? [r.originaladdress1, r.originalcity, r.originalstate, r.originalzip].filter(x => x && x !== 'NULL').join(', ')
      : r.address || null;
    return {
      permit_no: String(permit_no),
      permit_type:      r.permittypedesc || r.permittype || r.permit_type || null,
      work_description: r.description || r.projectname || r.proposeduse || r.work_desc || null,
      address,
      neighborhood:     r.neighborhood || null,           // dataset has no neighborhood field
      status:           r.statuscurrent || r.status || null,
      applied_date:     r.applieddate || r.applied_date || null,
      issued_date:      r.issueddate || r.issued_date || null,
      finaled_date:     r.completeddate || r.finaled_date || null,
      estimated_value:  r.estprojectcost != null ? parseFloat(r.estprojectcost)
                      : r.estimated_value != null ? parseFloat(r.estimated_value) : null,
      contractor:       r.contractorcompanyname || r.contractor || null,
      lat, lon,
      last_seen: now,
    };
  }).filter(Boolean);

  const { newCount, updatedCount, skipped } = runUpserts(
    db, rows,
    row => existsStmt.get(row.permit_no),
    insertStmt, updateStmt
  );

  const total = db.prepare('SELECT COUNT(*) AS n FROM permits').get().n;
  console.log(`  permits:              new=${newCount}  updated=${updatedCount}  skipped=${skipped}  total=${total}`);
}

// ─── Crime ────────────────────────────────────────────────────────────────────

function ingestCrime(db) {
  const filePath = path.join(DATA_DIR, 'crime-raw.json');
  if (!fs.existsSync(filePath)) { console.log('  crime-raw.json not found, skipping.'); return; }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!raw.length) { console.log('  No crime records.'); return; }

  const existsStmt = db.prepare('SELECT report_no FROM crime WHERE report_no = ?');
  const insertStmt = db.prepare(`
    INSERT INTO crime (report_no, offense, description, address, area, reported_date, from_date, lat, lon, last_seen)
    VALUES (@report_no, @offense, @description, @address, @area, @reported_date, @from_date, @lat, @lon, @last_seen)
  `);
  const updateStmt = db.prepare(`
    UPDATE crime SET offense=@offense, description=@description, address=@address, area=@area,
      reported_date=@reported_date, from_date=@from_date, lat=@lat, lon=@lon, last_seen=@last_seen
    WHERE report_no=@report_no
  `);

  const rows = raw.map(r => {
    // Real schema: geoloc is the Point field, location is a text POINT string,
    // offense_type is the code (not 'offense').
    const { lat, lon } = coordsFromRecord(r, 'geoloc', 'location', 'mapped_location');
    const report_no = r.report_no || r.case_no || r.id;
    if (!report_no) return null;
    return {
      report_no: String(report_no),
      offense:       r.offense_type || r.offense || null,
      description:   r.description || r.ibrs || null,
      address:       r.address || r.incident_address || null,
      area:          r.area || r.beat || r.city_council_district || null,
      reported_date: r.reported_date || r.report_date || null,
      from_date:     r.from_date || r.reported_time || null,
      lat, lon,
      last_seen: now,
    };
  }).filter(Boolean);

  const { newCount, updatedCount, skipped } = runUpserts(
    db, rows,
    row => existsStmt.get(row.report_no),
    insertStmt, updateStmt
  );

  const total = db.prepare('SELECT COUNT(*) AS n FROM crime').get().n;
  console.log(`  crime:                new=${newCount}  updated=${updatedCount}  skipped=${skipped}  total=${total}`);
}

// ─── Property Violations ──────────────────────────────────────────────────────

function ingestViolations(db) {
  const filePath = path.join(DATA_DIR, 'violations-raw.json');
  if (!fs.existsSync(filePath)) { console.log('  violations-raw.json not found, skipping.'); return; }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!raw.length) { console.log('  No violation records.'); return; }

  const existsStmt = db.prepare('SELECT case_no FROM property_violations WHERE case_no = ?');
  const insertStmt = db.prepare(`
    INSERT INTO property_violations (case_no, violation_code, violation_description, address,
      neighborhood, status, opened_date, closed_date, lat, lon, last_seen)
    VALUES (@case_no, @violation_code, @violation_description, @address,
      @neighborhood, @status, @opened_date, @closed_date, @lat, @lon, @last_seen)
  `);
  const updateStmt = db.prepare(`
    UPDATE property_violations SET violation_code=@violation_code,
      violation_description=@violation_description, address=@address, neighborhood=@neighborhood,
      status=@status, opened_date=@opened_date, closed_date=@closed_date,
      lat=@lat, lon=@lon, last_seen=@last_seen
    WHERE case_no=@case_no
  `);

  const rows = raw.map(r => {
    // Real schema: lat_long is the Point field, workorder_ is the case id,
    // issue_type is the code/category, current_status, open_date_time.
    const { lat, lon } = coordsFromRecord(r, 'lat_long', 'case_location', 'location');
    const case_no = r.workorder_ || r.case_no || r.id || r.casenumber || r.case_number;
    if (!case_no) return null;
    return {
      case_no: String(case_no),
      violation_code:        r.issue_type || r.violation_code || r.code || null,
      violation_description: r.reported_issue || r.issue_sub_type || r.violation_description || r.description || null,
      address:     r.incident_address || r.address || null,
      neighborhood: r.neighborhood || null,   // no neighborhood column; city_council_district is available
      status:      r.current_status || r.status || null,
      opened_date: r.open_date_time || r.opened_date || r.open_date || null,
      closed_date: r.closed_date || r.close_date || null,
      lat, lon,
      last_seen: now,
    };
  }).filter(Boolean);

  const { newCount, updatedCount, skipped } = runUpserts(
    db, rows,
    row => existsStmt.get(row.case_no),
    insertStmt, updateStmt
  );

  const total = db.prepare('SELECT COUNT(*) AS n FROM property_violations').get().n;
  console.log(`  property_violations:  new=${newCount}  updated=${updatedCount}  skipped=${skipped}  total=${total}`);
}

// ─── Dangerous Buildings ──────────────────────────────────────────────────────

function ingestDangerousBuildings(db) {
  const filePath = path.join(DATA_DIR, 'dangerous-buildings-raw.json');
  if (!fs.existsSync(filePath)) { console.log('  dangerous-buildings-raw.json not found, skipping.'); return; }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!raw.length) { console.log('  No dangerous building records.'); return; }

  const existsStmt = db.prepare('SELECT case_number FROM dangerous_buildings WHERE case_number = ?');
  const insertStmt = db.prepare(`
    INSERT INTO dangerous_buildings (case_number, address, neighborhood, status, case_opened,
      council_district, zip_code, lat, lon, last_seen)
    VALUES (@case_number, @address, @neighborhood, @status, @case_opened,
      @council_district, @zip_code, @lat, @lon, @last_seen)
  `);
  const updateStmt = db.prepare(`
    UPDATE dangerous_buildings SET address=@address, neighborhood=@neighborhood, status=@status,
      case_opened=@case_opened, council_district=@council_district, zip_code=@zip_code,
      lat=@lat, lon=@lon, last_seen=@last_seen
    WHERE case_number=@case_number
  `);

  const rows = raw.map(r => {
    const { lat, lon } = coordsFromRecord(r, 'case_location', 'location', 'mapped_location');
    const case_number = r.case_number || r.casenumber || r.id;
    if (!case_number) return null;
    return {
      case_number: String(case_number),
      address:          r.address || null,
      neighborhood:     r.neighborhood || null,
      status:           r.status || null,
      case_opened:      r.case_opened || r.open_date || r.date_opened || null,
      council_district: r.council_district || r.councildistrict || null,
      zip_code:         r.zip_code || r.zipcode || null,
      lat, lon,
      last_seen: now,
    };
  }).filter(Boolean);

  const { newCount, updatedCount, skipped } = runUpserts(
    db, rows,
    row => existsStmt.get(row.case_number),
    insertStmt, updateStmt
  );

  const total = db.prepare('SELECT COUNT(*) AS n FROM dangerous_buildings').get().n;
  console.log(`  dangerous_buildings:  new=${newCount}  updated=${updatedCount}  skipped=${skipped}  total=${total}`);
}

// ─── Budget ───────────────────────────────────────────────────────────────────

function ingestBudget(db, filename, budgetType) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) { console.log(`  ${filename} not found, skipping.`); return; }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!raw.length) { console.log(`  No ${budgetType} budget records.`); return; }

  const existsStmt = db.prepare('SELECT id FROM budget WHERE id = ?');
  const insertStmt = db.prepare(`
    INSERT INTO budget (id, fiscal_year, fund, department, division, account, description, budget_type, amount, last_seen)
    VALUES (@id, @fiscal_year, @fund, @department, @division, @account, @description, @budget_type, @amount, @last_seen)
  `);
  const updateStmt = db.prepare(`
    UPDATE budget SET fiscal_year=@fiscal_year, fund=@fund, department=@department,
      division=@division, account=@account, description=@description,
      budget_type=@budget_type, amount=@amount, last_seen=@last_seen
    WHERE id=@id
  `);

  const rows = raw.map((r, idx) => {
    // Real schema (ygzn-3xmu expenditures / rv2u-bdnp revenue): year, goal,
    // department, program, activity, division, deptid, expense_category,
    // expenditure_type, fund_name, posted_at_fund_code, fund_type, description,
    // budget_object_code, posted_at_project_code, proposed, adopted.
    const fiscal_year = r.year || r.fiscal_year || r.fiscalyear || r.fy || '';
    const fund        = r.fund_name || r.fund || '';
    const department  = r.department || r.dept || '';
    const division    = r.division || r.div || '';
    const account     = r.budget_object_code || r.account || r.account_no || r.account_number || '';
    const program     = r.program || '';
    const activity    = r.activity || '';
    const project     = r.posted_at_project_code || '';
    const category    = r.expense_category || r.expenditure_type || '';
    // Compose a wide ID so distinct line items don't collide (idx as final tie-breaker).
    const id = [fiscal_year, fund, department, division, account, program, activity, project, category, idx]
      .join('|').slice(0, 350) || r.id || null;
    if (!id) return null;
    return {
      id,
      fiscal_year,
      fund,
      department,
      division,
      account,
      description: r.description || r.account_description || r.desc || r.program || null,
      budget_type: budgetType,
      amount: r.adopted != null && r.adopted !== '' ? parseFloat(r.adopted)
            : r.proposed != null && r.proposed !== '' ? parseFloat(r.proposed)
            : r.amount != null ? parseFloat(r.amount)
            : r.actual != null ? parseFloat(r.actual) : null,
      last_seen: now,
    };
  }).filter(Boolean);

  const { newCount, updatedCount, skipped } = runUpserts(
    db, rows,
    row => existsStmt.get(row.id),
    insertStmt, updateStmt
  );

  const total = db.prepare(`SELECT COUNT(*) AS n FROM budget WHERE budget_type='${budgetType}'`).get().n;
  console.log(`  budget (${budgetType.padEnd(12)}): new=${newCount}  updated=${updatedCount}  skipped=${skipped}  total=${total}`);
}

// ─── Vendor Payments ──────────────────────────────────────────────────────────

function ingestVendorPayments(db) {
  const filePath = path.join(DATA_DIR, 'vendor-payments-raw.json');
  if (!fs.existsSync(filePath)) { console.log('  vendor-payments-raw.json not found, skipping.'); return; }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!raw.length) { console.log('  No vendor payment records.'); return; }

  const existsStmt = db.prepare('SELECT id FROM vendor_payments WHERE id = ?');
  const insertStmt = db.prepare(`
    INSERT INTO vendor_payments (id, vendor_name, department, amount, payment_date, description, fiscal_year, last_seen)
    VALUES (@id, @vendor_name, @department, @amount, @payment_date, @description, @fiscal_year, @last_seen)
  `);
  const updateStmt = db.prepare(`
    UPDATE vendor_payments SET vendor_name=@vendor_name, department=@department, amount=@amount,
      payment_date=@payment_date, description=@description, fiscal_year=@fiscal_year, last_seen=@last_seen
    WHERE id=@id
  `);

  const rows = raw.map((r, idx) => {
    // Real KC schema (39kh-2k2z): vendor_name, payment_no, payment_date,
    // payment_amount, payment_method, voucher, sum_amount, fund, fund_descr,
    // deptid, deptid_descr, account, account_descr.
    const vendor_name  = r.vendor_name || r.vendor || r.payee || '';
    const payment_date = r.payment_date || r.check_date || r.paid_date || '';
    const amount = r.payment_amount != null ? r.payment_amount
                 : r.amount != null ? r.amount
                 : r.sum_amount != null ? r.sum_amount
                 : r.check_amount || r.paid_amount || null;
    // payment_no + voucher is the natural key; use idx to break any residual ties.
    const id = r.payment_no
      ? `${r.payment_no}|${r.voucher || ''}|${idx}`
      : [vendor_name, payment_date, amount, r.voucher || '', idx].join('|').slice(0, 300);
    if (!id) return null;
    return {
      id: String(id),
      vendor_name:  vendor_name || null,
      department:   r.deptid_descr || r.department || r.dept || null,
      amount:       amount != null && amount !== '' ? parseFloat(amount) : null,
      payment_date: payment_date || null,
      description:  r.account_descr || r.description || r.purpose || r.fund_descr || null,
      fiscal_year:  r.fiscal_year || r.fy || null,
      last_seen:    now,
    };
  }).filter(Boolean);

  const { newCount, updatedCount, skipped } = runUpserts(
    db, rows,
    row => existsStmt.get(row.id),
    insertStmt, updateStmt
  );

  const total = db.prepare('SELECT COUNT(*) AS n FROM vendor_payments').get().n;
  console.log(`  vendor_payments:      new=${newCount}  updated=${updatedCount}  skipped=${skipped}  total=${total}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const db = getDb();

  console.log('NeighborhoodOS — Multi-source ingest');
  console.log('=====================================');

  ingestPermits(db);
  ingestCrime(db);
  ingestViolations(db);
  ingestDangerousBuildings(db);
  ingestBudget(db, 'budget-expenditures-raw.json', 'expenditure');
  ingestBudget(db, 'budget-revenue-raw.json', 'revenue');
  ingestVendorPayments(db);

  console.log('\n── Overall DB totals ──');
  const tables = [
    'requests_311', 'permits', 'crime', 'property_violations',
    'dangerous_buildings', 'budget', 'vendor_payments',
  ];
  for (const t of tables) {
    try {
      const n = db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
      console.log(`  ${t.padEnd(24)} ${n}`);
    } catch (e) {
      console.log(`  ${t.padEnd(24)} (error: ${e.message})`);
    }
  }

  db.close();
  console.log('\nIngest complete.');
}

main();
