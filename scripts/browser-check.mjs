// Automated tests use an isolated headless browser against the development server.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8765';
const artifacts=process.env.QA_ARTIFACTS||'artifacts/local';fs.mkdirSync(artifacts,{recursive:true});
const xml=fs.readFileSync('sitemap.xml','utf8');const routes=[...xml.matchAll(/<loc>https:\/\/neighborhoodos.org([^<]*)<\/loc>/g)].map(m=>m[1]);
const browser=await chromium.launch({headless:true});const failures=[],results=[],errors=[];
try{
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const paths=viewport.width===1440?routes:['/','/learn/','/learn/es/','/kit/','/brief/','/resources/','/sessions/','/funders/','/neighborhoods/linwood/','/guide/','/guide/budget-and-hardware/'];
 for(const route of paths){await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  if(overflow)failures.push(`${viewport.width} ${route}: horizontal page overflow`);
  if(axe.violations.length)for(const v of axe.violations)failures.push(`${viewport.width} ${route}: ${v.id}: ${v.nodes.map(n=>n.target.join(' ')).join('; ')}`);
  results.push({route,width:viewport.width,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:axe.incomplete.map(v=>v.id),overflow});
  if(['/', '/resources/', '/neighborhoods/linwood/','/learn/','/guide/','/sessions/'].includes(route)){const name=route==='/'?'home':route.replaceAll('/','-').replace(/^-|-$/g,'');await page.screenshot({path:`${artifacts}/${name}-${viewport.width}.png`,fullPage:route!=='/'});}
 }
 await context.close();console.log(`Audited ${paths.length} pages at ${viewport.width}px.`);
}
const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();const outbound=[];
page.on('request',r=>{if(!r.url().startsWith(base))outbound.push(r.url());});
await page.goto(base+'/');await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'Skip to main content');await page.keyboard.press('Enter');
await page.locator('.claim[data-kind=invented]').click();await page.locator('.claim[data-kind=danger]').click();await page.locator('#ex-check').click();assert.match(await page.locator('#ex-result').innerText(),/caught both/);await page.locator('#ex-reset').click();assert.equal(await page.locator('.claim[aria-pressed=true]').count(),0);
await page.goto(base+'/brief/');await page.locator('#b-example').click();assert.match(await page.locator('#o-what').innerText(),/streetlight/);await page.locator('#b-what').fill('Private local-only test text');assert.equal(await page.locator('#o-what').innerText(),'Private local-only test text');await page.locator('#b-clear').click();assert.equal(await page.locator('#b-what').inputValue(),'');
await page.goto(base+'/resources/');await page.locator('#resource-search').fill('Ivanhoe');assert.equal(await page.locator('.resource:visible').count(),1);await page.locator('#resource-search').fill('no-such-resource-987654');assert.equal(await page.locator('.resource:visible').count(),0);assert.equal(await page.locator('#resource-empty').isVisible(),true);await page.locator('#resource-search').fill('');await page.locator('#resource-category').selectOption('Small business');assert.equal(await page.locator('.resource:visible').count(),3);
await page.goto(base+'/learn/');await page.locator('#quiz-check').click();assert.match(await page.locator('#quiz-score').innerText(),/Answer all three/);for(const input of await page.locator('input[data-correct]').all())await input.check();await page.locator('#quiz-check').click();assert.match(await page.locator('#quiz-score').innerText(),/3 of 3/);
await page.goto(base+'/learn/es/');for(const input of await page.locator('input[value=correct]').all())await input.check();await page.locator('#spanish-quiz button').click();assert.match(await page.locator('#spanish-score').innerText(),/3 de 3/);
for(const [old,target] of [['/local/','/neighborhoods/linwood/'],['/launch.html','/guide/'],['/pilot/','/guide/']]){await page.goto(base+old);await page.waitForURL(base+target);}
assert.equal(outbound.length,0,'Resident flows made third-party requests: '+outbound.join(','));
// Check reflow at 320 CSS px, and 200% equivalent on an 800px layout.
for(const width of [320,400]){await page.setViewportSize({width,height:900});for(const route of ['/','/brief/','/resources/','/neighborhoods/linwood/']){await page.goto(base+route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`Reflow ${width} ${route}`);}}
await page.setViewportSize({width:1280,height:900});await page.goto(base+'/neighborhoods/linwood/');await page.emulateMedia({media:'print'});await page.pdf({path:artifacts+'/linwood-print.pdf',format:'Letter',printBackground:true});await page.emulateMedia({media:'screen'});
await page.goto(base+'/brief/');await page.locator('#b-example').click();await page.evaluate(()=>document.body.classList.add('print-brief'));await page.emulateMedia({media:'print'});await page.pdf({path:artifacts+'/brief-print.pdf',format:'Letter',printBackground:true});
assert.deepEqual(errors,[]);console.log('Resident flows, local-only requests, redirects, reflow, and print export passed.');await context.close();
}finally{await browser.close();fs.writeFileSync(artifacts+'/browser-audit.json',JSON.stringify({base,results,failures,errors},null,2));}
console.log(`Browser audit: ${results.length} viewport/page checks; ${failures.length} violations or overflow failures.`);for(const f of failures)console.log(f);if(failures.length)process.exitCode=1;
