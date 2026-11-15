import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {load} from 'cheerio';
const checked=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
await import('./refresh-calendar.mjs');
// Fonts served from this domain; retain their open font licenses.
await mkdir('assets/fonts',{recursive:true});
for(const [family,file] of [['Barlow+Condensed:wght@600','barlow-condensed-600'],['Atkinson+Hyperlegible:wght@400','atkinson-400'],['Atkinson+Hyperlegible:wght@700','atkinson-700']]){
  const css=await (await fetch('https://fonts.googleapis.com/css2?family='+family+'&display=swap',{headers:{'User-Agent':'Mozilla/5.0'}})).text();
  const url=css.match(/url\((https:[^)]+)\)/)?.[1];if(!url)throw Error('Font URL missing');await writeFile(`assets/fonts/${file}.ttf`,Buffer.from(await (await fetch(url)).arrayBuffer()));
}
for(const [name,url] of [['Barlow-OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/OFL.txt'],['Atkinson-OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/atkinsonhyperlegible/OFL.txt']]){const r=await fetch(url);if(!r.ok)throw Error('Font license unavailable');await writeFile('assets/fonts/'+name,await r.text());}
