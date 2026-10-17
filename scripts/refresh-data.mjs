import {refreshPermits} from './permits.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {summarize} from './civic-data.mjs';
const base='https://data.kcmo.org/resource/';
async function query(id,params){const u=new URL(base+id+'.json');for(const [k,v] of Object.entries(params))u.searchParams.set('$'+k,v);const r=await fetch(u,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`${id}: ${r.status} ${await r.text()}`);return r.json();}
async function all(id,params){let rows=[];for(let offset=0;;offset+=10000){const page=await query(id,{...params,limit:10000,offset});rows.push(...page);if(page.length<10000)break;if(offset>=200000)throw Error('Unexpected row limit; refusing partial snapshot');}return rows;}
const config=JSON.parse(await readFile('data/neighborhoods.json','utf8'));
const borders=await all('vq6h-tqrf',{select:'nbhname,nbhid,the_geom',order:'nbhid'});
const selected=borders.filter(b=>config.some(c=>c.officialNames.includes(b.nbhname)));
for(const c of config)for(const name of c.officialNames)if(!selected.some(b=>b.nbhname===name))throw Error('Missing official boundary '+name);
await writeFile('data/boundaries.json',JSON.stringify({source:base+'vq6h-tqrf.json',checked:new Date().toISOString(),neighborhoods:selected}));
const asOf=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const since=new Date(asOf+'T00:00:00Z');since.setUTCDate(since.getUTCDate()-365);
const start=since.toISOString().slice(0,19),end=asOf+'T23:59:59';
const window=`open_date_time >= '${start}' AND open_date_time <= '${end}'`;
const max=(await query('d4px-6rwg',{select:'max(open_date_time) as latest'}))[0]?.latest?.slice(0,10)||null;
const histogram=await all('d4px-6rwg',{select:'issue_type,days_to_close,count(*) as n',where:`${window} AND lower(current_status) in ('resolved','closed','complete','completed') AND resolved_date IS NOT NULL AND days_to_close >= 0`,group:'issue_type,days_to_close',order:'issue_type,days_to_close'});
function wkt(g){const ring=r=>'('+r.map(p=>p.join(' ')).join(',')+')';return 'MULTIPOLYGON ('+g.coordinates.map(p=>'('+p.map(ring).join(',')+')').join(',')+')';}
await mkdir('data/snapshots',{recursive:true});
for(const area of config){
  const clauses=selected.filter(b=>area.officialNames.includes(b.nbhname)).map(b=>`within_polygon(lat_long, '${wkt(b.the_geom)}')`);
  const rows=await all('d4px-6rwg',{select:'reported_issue,issue_type,current_status,open_date_time,resolved_date,days_to_close,department_work_group,report_source,incident_address',where:`${window} AND (${clauses.join(' OR ')})`,order:'open_date_time,reported_issue'});
  const snapshot=summarize(rows,{asOf,area:area.slug,sourceMax:max,cityHistogram:histogram});
  await writeFile(`data/snapshots/${area.slug}.json`,JSON.stringify(snapshot,null,2)+'\n');
  console.log(`${area.slug}: ${snapshot.total} requests; ${snapshot.counts.canceled} canceled; source through ${max}`);
}

await refreshPermits({all,query,config,borders:selected,asOf,start,end,wkt});
