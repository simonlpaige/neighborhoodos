// Pure publication rules. Raw city rows stay in memory and never enter snapshots.
export function statusOf(row) {
  const s = String(row.current_status || '').trim().toLowerCase();
  if (/cancel|duplicate|void/.test(s)) return 'canceled';
  if (/^(resolved|closed|complete|completed)$/.test(s)) return 'resolved';
  if (s) return 'open';
  return row.resolved_date ? 'resolved' : 'open';
}
export const publicInfrastructure = /^(Street Maintenance|Street Lights|Streetlights|Street Lighting|Traffic Signals|Traffic Signs|Sidewalks|Trees in City Right.of.Way)$/i;
export function publicBlock(row) {
  if (!publicInfrastructure.test(row.issue_type || '')) return null;
  const m = String(row.incident_address || '').match(/^(\d+)\s+(.+)$/);
  return m ? `${Math.floor(Number(m[1]) / 100) * 100} block of ${m[2].replace(/\s+Kansas City.*$/i,'')}` : null;
}
export function median(values) {
  const a = values.filter(Number.isFinite).sort((a,b)=>a-b);
  return a.length ? (a[Math.floor((a.length-1)/2)]+a[Math.ceil((a.length-1)/2)])/2 : null;
}
export function weightedMedian(rows) {
  const a = rows.map(r=>({days:Number(r.days_to_close), n:Number(r.n)})).filter(r=>Number.isFinite(r.days)&&r.days>=0&&r.n>0).sort((a,b)=>a.days-b.days);
  const count=a.reduce((s,r)=>s+r.n,0); if (!count) return null;
  const targets=[Math.floor((count-1)/2),Math.ceil((count-1)/2)];
  const values=targets.map(target=>{let n=0;for(const r of a){n+=r.n;if(n>target)return r.days;}});
  return (values[0]+values[1])/2;
}
export function summarize(rows, {asOf, area, sourceMax, cityHistogram=[]}) {
  const now = new Date(asOf+'T23:59:59Z');
  const age = r => (now-new Date(r.open_date_time+'Z'))/86400000;
  const recent=days=>rows.filter(r=>age(r)>=0&&age(r)<=days);
  const counts={open:0,resolved:0,canceled:0}; rows.forEach(r=>counts[statusOf(r)]++);
  const types=[...new Set(rows.map(r=>r.issue_type||'Other'))].map(type=>{
    const own=rows.filter(r=>(r.issue_type||'Other')===type);
    const closed=own.filter(r=>statusOf(r)==='resolved'&&r.resolved_date&&Number.isFinite(Number(r.days_to_close))&&Number(r.days_to_close)>=0);
    return {type,count:own.length,medianDays:median(closed.map(r=>Number(r.days_to_close))),closedSample:closed.length,cityMedianDays:weightedMedian(cityHistogram.filter(r=>r.issue_type===type))};
  }).sort((a,b)=>b.count-a.count);
  const monthKeys=Array.from({length:12},(_,i)=>{const d=new Date(now);d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-11+i);return d.toISOString().slice(0,7);});
  return {
    area,asOf,sourceMax,generatedAt:new Date().toISOString(),window:'Requests opened in the trailing 365 days; final trend month is partial.',total:rows.length,requests30:recent(30).length,requests90:recent(90).length,counts,
    openOver60:rows.filter(r=>statusOf(r)==='open'&&age(r)>60).length,types,
    trend:monthKeys.map(month=>({month,count:rows.filter(r=>r.open_date_time.startsWith(month)).length,types:Object.fromEntries(types.slice(0,5).map(t=>[t.type,rows.filter(r=>r.open_date_time.startsWith(month)&&r.issue_type===t.type).length]))})),
    channels:Object.entries(rows.reduce((a,r)=>{const k=/phone/i.test(r.report_source||'')?'Phone':/ios|android|mobile/i.test(r.report_source||'')?'Mobile app':'Other / not specified';a[k]=(a[k]||0)+1;return a;},{})).map(([name,count])=>({name,count})),
    stuck:rows.filter(r=>statusOf(r)==='open'&&age(r)>60&&publicBlock(r)).sort((a,b)=>a.open_date_time.localeCompare(b.open_date_time)).slice(0,12).map(r=>({issue:r.issue_type,block:publicBlock(r),opened:r.open_date_time.slice(0,10),department:r.department_work_group||'See city source'})),
    privacy:'No household complaint locations, resident names, free text, coordinates, or individual animal / encampment records are published. Stuck list contains allowlisted public infrastructure only, rounded to a block.',
    method:'Resolved and canceled are separate. Closure medians use resolved records with a closure date and nonnegative duration, among requests opened in this window. They exclude still-open requests and do not estimate how long an open request will take. City comparison uses the same opening window and status rules. Unlocated records cannot be assigned to a neighborhood.'
  };
}
