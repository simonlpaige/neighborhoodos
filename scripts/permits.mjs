import {writeFile} from 'node:fs/promises';
export const PERMIT_SOURCE='w8jz-wjgn';
export const PARCEL_SOURCE='6g4y-sh3m';
export const BUILDING_TYPES=['CPPU - Building (Residential)','CPPU - Building (Commercial)'];
export function parcelKey(value){const s=String(value??'').trim();return /^\d+$/.test(s)&&Number(s)>0?String(Number(s)):null;}
export function permitBlock(address){const s=String(address||'').trim();const m=s.match(/^(\d+)\s+([A-Za-z0-9 .'-]+)$/);return m?`${Math.floor(Number(m[1])/100)*100} block of ${m[2].replace(/\s+(?:apt|unit|suite|ste)\b.*$/i,'').trim()}`:'Block unavailable';}
const statuses=new Set(['issued','closed','finaled','expired','cancelled','canceled','void','voided','revoked','active','complete','completed','on hold']);
export function summarizePermits(rows,parcelIds,{area,asOf,sourceMax,sourceUpdated,parcelUpdated}){
 const unique=new Map();const cutoff=new Date(asOf+'T00:00:00Z');cutoff.setUTCDate(cutoff.getUTCDate()-365);const minimum=cutoff.toISOString().slice(0,10);
 for(const row of rows){if(!BUILDING_TYPES.includes(row.permit_type)||!parcelIds.has(parcelKey(row.main_parcel_number))||! /^[A-Z0-9-]{3,50}$/i.test(row.permit_number||''))continue;
  const d=String(row.issue_date||'').slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||d>asOf||d<minimum)continue;
  const old=unique.get(row.permit_number);if(!old||JSON.stringify(row).localeCompare(JSON.stringify(old))<0)unique.set(row.permit_number,row);
 }
 const records=[...unique.values()].sort((a,b)=>b.issue_date.localeCompare(a.issue_date)||a.permit_number.localeCompare(b.permit_number));
 const age=r=>(new Date(asOf+'T23:59:59Z')-new Date(r.issue_date.slice(0,10)+'T00:00:00Z'))/86400000;
 const count=days=>records.filter(r=>age(r)<days).length;
 const byType=BUILDING_TYPES.map(type=>({type:type.includes('(Residential)')?'Residential':'Commercial',count:records.filter(r=>r.permit_type===type).length}));
 return {area,asOf,source:PERMIT_SOURCE,sourceMax,sourceUpdated,parcelSource:PARCEL_SOURCE,parcelUpdated,window:'Unique building permits issued in the trailing 365 days; not applications or all trade permits.',total:records.length,issued30:count(30),issued90:count(90),byType,
  recent:records.slice(0,15).map(r=>({number:r.permit_number,issued:r.issue_date.slice(0,10),type:r.permit_type.includes('(Residential)')?'Residential building':'Commercial building',block:permitBlock(r.main_address_line1),status:statuses.has(String(r.permit_status||'').toLowerCase())?String(r.permit_status).toLowerCase():'See city record'})),
  method:'Current city-issued permits are joined by parcel number to the city parcel polygons intersecting the dashboard’s named official neighborhood boundaries. Boundary-crossing parcels can appear in adjacent areas. Only residential and commercial building permits with an issue date are included; electrical, plumbing, mechanical, zoning, and applications without an issue date are excluded. A permit is not proof that work has begun, finished, or is currently authorized. Missing or changed parcel identifiers can prevent a match; zero matched records does not establish no construction.',
  privacy:'No owner names, contractor details, project descriptions, parcel identifiers, exact addresses, coordinates, or raw city rows are published. Recent permit records show a 100-block, public permit number, issue date, category, and recorded status only.'};
}
export async function refreshPermits({all,query,config,borders,asOf,start,end,wkt}){
 const meta=await(await fetch(`https://data.kcmo.org/api/views/${PERMIT_SOURCE}.json`,{signal:AbortSignal.timeout(30000)})).json();
 const parcelMeta=await(await fetch(`https://data.kcmo.org/api/views/${PARCEL_SOURCE}.json`,{signal:AbortSignal.timeout(30000)})).json();
 if(!meta.rowsUpdatedAt||!parcelMeta.rowsUpdatedAt)throw Error('Permit or parcel source metadata unavailable');
 const sourceUpdated=new Date(meta.rowsUpdatedAt*1000).toISOString().slice(0,10),parcelUpdated=new Date(parcelMeta.rowsUpdatedAt*1000).toISOString().slice(0,10);
 const where=`issue_date >= '${start}' AND issue_date <= '${end}' AND permit_type in ('${BUILDING_TYPES.join("','")}')`;
 const sourceMax=(await query(PERMIT_SOURCE,{select:'max(issue_date) as latest',where:`issue_date <= '${end}'`}))[0]?.latest?.slice(0,10);
 if(!sourceMax)throw Error('Permit source has no dated records; refusing an empty refresh');
 const rows=await all(PERMIT_SOURCE,{select:'permit_number,issue_date,permit_type,permit_status,main_parcel_number,main_address_line1',where,order:'permit_number,issue_date,main_parcel_number,main_address_line1'});
 if(!rows.length)throw Error('Current permit source returned no building records; refusing a misleading zero');
 const pending=[];
 for(const area of config){
  const clauses=borders.filter(b=>area.officialNames.includes(b.nbhname)).map(b=>`intersects(the_geom, '${wkt(b.the_geom)}')`);
  const parcels=await all(PARCEL_SOURCE,{select:'kivapin',where:clauses.join(' OR '),order:'kivapin'});
  const ids=new Set(parcels.map(p=>parcelKey(p.kivapin)).filter(Boolean));if(!ids.size)throw Error('No usable parcel geometry for '+area.slug);
  const snapshot=summarizePermits(rows,ids,{area:area.slug,asOf,sourceMax,sourceUpdated,parcelUpdated});
  pending.push([area.slug,snapshot]);
 }
 for(const [slug,snapshot] of pending){await writeFile(`data/snapshots/${slug}-permits.json`,JSON.stringify(snapshot,null,2)+'\n');console.log(`${slug}: ${snapshot.total} unique building permits, ${snapshot.issued30} issued in 30 days; city source through ${sourceMax}; parcel map ${parcelUpdated}`);}
}
