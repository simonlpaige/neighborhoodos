import {writeFile} from 'node:fs/promises';
import {load} from 'cheerio';
const source='https://www.kcdigitaldrive.org/events/';
const checked=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const response=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`Calendar HTTP ${response.status}`);
const $=load(await response.text());const events=[];
const links=$('h3 a[href*="/event/"]').toArray().map(e=>({title:$(e).text().trim(),url:$(e).attr('href')}));
if(!links.length)throw Error('Organizer calendar structure changed; retaining previous snapshot');
for(const e of links){
  const r=await fetch(e.url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(`Event detail HTTP ${r.status}`);
  const q=load(await r.text());const text=q('article').text().replace(/\s+/g,' ').trim();
  const rawDate=text.match(/Event Date:\s*(.+?)(?=Time:|Location:|Admission:|$)/)?.[1]?.trim();
  if(!rawDate)throw Error('Event date missing: '+e.url);
  const d=new Date(rawDate.replace(/(\d+)(st|nd|rd|th)\b/g,'$1')+' 12:00:00 GMT');if(!Number.isFinite(d.valueOf()))throw Error('Unrecognized date '+rawDate);
  const startDate=d.toISOString().slice(0,10);
  if(startDate<checked)continue;
  const location=text.match(/Location:\s*(.+?)(?=Admission:|$)/)?.[1]?.trim()||'Check organizer’s listing';
  events.push({...e,startDate,endDate:startDate,location,organizer:'KC Digital Drive',program:'Related KCDD event; not a confirmed NeighborhoodOS clinic'});
}
if(!events.length)throw Error('No future listings could be confirmed; retaining prior snapshot and calendar link');
await writeFile('data/events.json',JSON.stringify({checked,source,events},null,2)+'\n');
console.log(`${events.length} future listings from KCDD’s own event details, checked ${checked}.`);
