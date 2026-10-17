import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {load} from 'cheerio';
import {readingRoute} from './ui-settings.mjs';
const xml=fs.readFileSync('sitemap.xml','utf8');const routes=[...xml.matchAll(/<loc>https:\/\/neighborhoodos.org([^<]*)<\/loc>/g)].map(m=>m[1]);
const failures=[],warnings=[];
for(const route of routes){const file=route==='/'?'index.html':route.slice(1)+'index.html';const html=fs.readFileSync(file,'utf8');const $=load(html);
  for(const [name,pass] of [['one H1',$('h1').length===1],['title',$('title').text().length>10],['description',$('meta[name=description]').attr('content')?.length>30],['canonical',$('link[rel=canonical]').attr('href')==='https://neighborhoodos.org'+route],['language',$('html').attr('lang')],['main landmark',$('main#main').length===1],['skip link',$('a.skip-link[href="#main"]').length===1],['local fonts',!html.includes('fonts.googleapis.com')&&!html.includes('fonts.gstatic.com')]])if(!pass)failures.push(`${route}: ${name}`);
  $('script').each((_,s)=>{const type=$(s).attr('type');try{if(type==='application/ld+json')JSON.parse($(s).text());else if(!$(s).attr('src'))new vm.Script($(s).text());}catch(e){failures.push(`${route}: invalid script ${e.message}`);}});
  const ids=new Set();$('[id]').each((_,el)=>{const id=$(el).attr('id');if(ids.has(id))failures.push(`${route}: duplicate id ${id}`);ids.add(id);});
  if($('html').attr('lang')==='en'){
    const copyFile=readingRoute(route).slice(1)+'index.html';
    if(!fs.existsSync(copyFile))failures.push(`${route}: missing public reading copy`);
    else{const copy=load(fs.readFileSync(copyFile,'utf8'));if(copy('form,input,select,textarea,script,iframe,object,embed').length)failures.push(`${route}: active controls in public reading copy`);if(copy('meta[name=robots]').attr('content')!=='noindex,follow')failures.push(`${route}: reading copy must not be indexed`);if(copy('link[rel=canonical]').attr('href')!=='https://neighborhoodos.org'+route)failures.push(`${route}: reading copy canonical`);}
    if($('.language-options li a').length!==6||$('#theme-toggle').attr('role')!=='switch')failures.push(`${route}: missing language or appearance controls`);
  }
  $('a[href],link[href],script[src],img[src]').each((_,el)=>{const ref=$(el).attr('href')||$(el).attr('src');if(!ref||/^(https?:|mailto:|tel:|data:)/.test(ref))return;const url=new URL(ref,'https://neighborhoodos.org'+route);let local=decodeURIComponent(url.pathname).slice(1);if(url.pathname.endsWith('/'))local+='index.html';if(!fs.existsSync(local))failures.push(`${route}: missing local target ${ref}`);else if(url.hash&&local.endsWith('.html')){const dest=load(fs.readFileSync(local,'utf8'));if(!dest('[id]').toArray().some(el=>dest(el).attr('id')===decodeURIComponent(url.hash.slice(1))))failures.push(`${route}: missing fragment ${ref}`);}});
}
const resources=JSON.parse(fs.readFileSync('data/resources.json'));for(const r of resources){if(!r.source||!r.lastChecked||!r.steward)failures.push('Missing directory provenance '+r.name);if(Date.now()-new Date(r.lastChecked)>183*864e5)warnings.push('Resource source older than six months: '+r.name);}
for(const file of fs.readdirSync('data/snapshots')){const s=fs.readFileSync('data/snapshots/'+file,'utf8');for(const field of ['incident_address','additional_questions','lat_long','latitude','longitude','owner_name'])if(s.includes('"'+field+'"'))failures.push('Unsafe public field '+file+': '+field);}
console.log(`Static web audit: ${routes.length} pages; ${failures.length} errors; ${warnings.length} stale-source warnings.`);for(const m of [...failures,...warnings])console.log(m);if(failures.length||warnings.length)process.exitCode=1;
