import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8765';
const artifacts=process.env.QA_ARTIFACTS||'artifacts/appearance';fs.mkdirSync(artifacts,{recursive:true});
const routes=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>https:\/\/neighborhoodos.org([^<]*)<\/loc>/g)].map(m=>m[1]);
const failures=[],results=[],errors=[];const browser=await chromium.launch();
try{
 for(const scheme of ['light','dark']){
  const context=await browser.newContext({colorScheme:scheme,viewport:{width:1440,height:1000}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const route of routes){await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);assert.equal(await page.locator('html').getAttribute('data-theme'),scheme);
   const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
   for(const v of a.violations)failures.push({scheme,route,id:v.id,nodes:v.nodes.map(n=>({target:n.target,detail:n.failureSummary}))});
   results.push({scheme,route,violations:a.violations.length});
  }
  console.log(`${scheme}: ${routes.length} pages audited.`);
  await page.goto(base+'/guide/start-here-for-partners/');await page.locator('.language-menu summary').click();await page.screenshot({path:`${artifacts}/partners-${scheme}-desktop.png`});
  assert.equal(await page.locator('.language-options li a').count(),5);await page.keyboard.press('Escape');assert.equal(await page.locator('.language-menu').getAttribute('open'),null);
  await page.setViewportSize({width:390,height:844});
  for(const route of ['/','/learn/','/kit/','/resources/','/neighborhoods/linwood/','/guide/start-here-for-partners/']){await page.goto(base+route);await page.locator('.language-menu summary').click();const box=await page.locator('.language-options').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=391,`Language menu outside viewport: ${route}`);const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();for(const v of a.violations)failures.push({scheme,route,width:390,id:v.id,nodes:v.nodes.map(n=>({target:n.target,detail:n.failureSummary}))});results.push({scheme,route,width:390,violations:a.violations.length});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
  await page.screenshot({path:`${artifacts}/partners-${scheme}-mobile.png`});await context.close();
 }
 const context=await browser.newContext({colorScheme:'light'});const page=await context.newPage();const outbound=[];page.on('request',r=>{if(!r.url().startsWith(base))outbound.push(r.url());});
 await page.goto(base+'/');assert.equal(await page.locator('html').getAttribute('data-theme-preference'),'system');
 await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
 await page.locator('#theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');assert.equal(await page.evaluate(()=>localStorage.getItem('nos-theme')),'light');
 await page.goto(base+'/guide/start-here-for-partners/');assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
 await page.locator('#theme-auto').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');assert.equal(await page.evaluate(()=>localStorage.getItem('nos-theme')),null);
 await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
 await page.goto(base+'/brief/');await page.locator('#b-what').fill('PRIVATE-TEST-ANSWER');await page.locator('.language-menu summary').click();for(const a of await page.locator('.language-options li a').all()){const href=await a.getAttribute('href');assert.ok(!href.includes('PRIVATE'));const u=new URL(href);assert.equal(u.searchParams.get('u'),'https://neighborhoodos.org/reading/brief/');}
 assert.deepEqual(outbound,[]);
 await page.goto(base+'/reading/brief/');assert.equal(await page.locator('input,textarea,select,form,script,iframe').count(),0);assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://neighborhoodos.org/brief/');assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex,follow');
 await page.goto(base+'/');await page.emulateMedia({colorScheme:'dark',media:'print'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--background').trim()),'#fff');
 await context.close();
 const blocked=await browser.newContext({colorScheme:'dark'});await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('Storage blocked');}}));const bp=await blocked.newPage();await bp.goto(base+'/');assert.equal(await bp.locator('html').getAttribute('data-theme'),'dark');await bp.locator('#theme-toggle').click();assert.equal(await bp.locator('html').getAttribute('data-theme'),'light');await bp.locator('#theme-auto').click();assert.equal(await bp.locator('html').getAttribute('data-theme'),'dark');await blocked.close();
 assert.deepEqual(errors,[]);console.log('System changes, saved overrides, Auto reset, blocked storage, reading-copy isolation, and light print output passed.');
}finally{await browser.close();fs.writeFileSync(artifacts+'/appearance-audit.json',JSON.stringify({base,results,failures,errors},null,2));}
console.log(`${results.length} appearance checks; ${failures.length} accessibility violations.`);for(const f of failures)console.log(JSON.stringify(f));if(failures.length)process.exitCode=1;
