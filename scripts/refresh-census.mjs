// Census "who lives here" figures for each area. Run by hand after a new ACS release:
//   node scripts/refresh-census.mjs
// Source: U.S. Census Bureau American Community Survey 5-year estimates, read through the
// Census Reporter API (no key needed). Only area-wide totals are saved. A failed run writes nothing.
import {readFile,writeFile} from 'node:fs/promises';
import {tractShare,combine} from './census-data.mjs';
const api='https://api.censusreporter.org/1.0';
const county='05000US29095'; // Jackson County, Missouri
const tables=['B01003','B01001','B11001','B25003','C16001','B28002'];
async function get(path){const r=await fetch(api+path,{headers:{'User-Agent':'neighborhoodos.org census refresh (https://github.com/simonlpaige/neighborhoodos)',Accept:'application/json'},signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error(`${path}: ${r.status}`);return r.json();}
const config=JSON.parse(await readFile('data/neighborhoods.json','utf8'));
const borders=JSON.parse(await readFile('data/boundaries.json','utf8')).neighborhoods;
const tracts=(await get(`/geo/show/tiger2023?geo_ids=140%7C${county}`)).features;
if(!tracts?.length)throw Error('No tract boundaries returned; refusing to write');
const out={};
for(const area of config){
  const polygons=borders.filter(b=>area.officialNames.includes(b.nbhname)).flatMap(b=>b.the_geom.coordinates);
  const shares=tracts.map(t=>({id:t.properties.geoid,name:t.properties.name,...tractShare(t.geometry,polygons)})).filter(t=>t.inside>0);
  const chosen=shares.filter(t=>t.inside>=0.05).sort((a,b)=>b.inside-a.inside);
  if(!chosen.length)throw Error('No census tract overlaps '+area.slug);
  const data=await get(`/data/show/latest?table_ids=${tables.join(',')}&geo_ids=${chosen.map(t=>t.id).join(',')}`);
  out[area.slug]={area:area.slug,release:data.release.name,years:data.release.years,checked:new Date().toISOString().slice(0,10),source:'https://censusreporter.org/',tracts:chosen.map(t=>({id:t.id.replace('14000US',''),name:t.name,shareInside:Math.round(t.inside*100)})),...combine(chosen.map(t=>data.data[t.id]),chosen.map(t=>t.inside)),method:'Census tracts do not follow neighborhood lines. Each overlapping tract is counted in proportion to the share of its land inside this area, which assumes people are spread evenly across a tract. These are rough survey estimates with a margin of error, not a count of residents.'};
  if(!(out[area.slug].population.estimate>0))throw Error('Empty census result for '+area.slug);
}
for(const [slug,snapshot] of Object.entries(out)){await writeFile(`data/snapshots/${slug}-census.json`,JSON.stringify(snapshot,null,2)+'\n');console.log(`${slug}: ${snapshot.population.estimate} people in ${snapshot.tracts.length} tracts (${snapshot.release})`);}
