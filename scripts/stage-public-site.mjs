// Only the public allowlist is deployed. No repository source or experiments.
import fs from 'node:fs';
import path from 'node:path';
const dest='.public-site';fs.mkdirSync(dest,{recursive:true});
const xml=fs.readFileSync('sitemap.xml','utf8');const routes=[...xml.matchAll(/<loc>https:\/\/neighborhoodos.org([^<]*)<\/loc>/g)].map(m=>m[1]);
const files=routes.map(route=>route==='/'?'index.html':route.slice(1)+'index.html').concat(['local/index.html','pilot/index.html','launch.html','404.html','sitemap.xml','robots.txt','llms.txt','CNAME','.nojekyll']);
for(const file of files){const target=path.join(dest,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(file,target);}
for(const dir of ['assets','downloads'])fs.cpSync(dir,path.join(dest,dir),{recursive:true});
fs.mkdirSync(path.join(dest,'data'),{recursive:true});for(const file of ['neighborhoods.json','boundaries.json','resources.json','events.json'])fs.copyFileSync('data/'+file,path.join(dest,'data',file));
fs.cpSync('data/snapshots',path.join(dest,'data/snapshots'),{recursive:true});
console.log(`Staged ${files.length} pages and discovery files plus public assets and filtered data. No raw city rows, source fragments, test output, or experimental backend.`);
