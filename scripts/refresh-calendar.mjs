import {writeFile} from 'node:fs/promises';
import {load} from 'cheerio';
import {parseEventDetail} from './calendar.mjs';
const source='https://www.kcdigitaldrive.org/events/';
const checked=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const response=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`Calendar HTTP ${response.status}`);
const $=load(await response.text());const events=[];
const links=$('h3 a[href*="/event/"]').toArray().map(e=>({title:$(e).text().trim(),url:$(e).attr('href')}));
if(!links.length)throw Error('Organizer calendar structure changed; retaining previous snapshot');
for(const e of links){
  const r=await fetch(e.url,{signal:AbortSignal.timeout(20000)}).catch(err=>({ok:false,status:err.name}));
  if(!r.ok){console.warn(`Skipped ${e.url}: event detail HTTP ${r.status}`);continue;}
  const q=load(await r.text());const text=q('article').text().replace(/\s+/g,' ').trim();
  const detail=parseEventDetail(text,checked);
  if(!detail){console.warn('Skipped '+e.url+': no readable event date');continue;}
  const {startDate,location}=detail;
  if(startDate<checked)continue;
  events.push({...e,startDate,endDate:startDate,location,organizer:'KC Digital Drive',program:'Related KCDD event; not a confirmed NeighborhoodOS clinic'});
}
if(!events.length)throw Error('No future listings could be confirmed; retaining prior snapshot and calendar link');
await writeFile('data/events.json',JSON.stringify({checked,source,events},null,2)+'\n');
console.log(`${events.length} future listings from KCDD’s own event details, checked ${checked}.`);
