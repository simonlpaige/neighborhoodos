import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8765';
const artifacts=process.env.QA_ARTIFACTS||'artifacts/polish';fs.mkdirSync(artifacts,{recursive:true});
const browser=await chromium.launch();let checks=0;
try{
 for(const colorScheme of ['light','dark'])for(const width of [1440,390]){
  const context=await browser.newContext({colorScheme,viewport:{width,height:1000},reducedMotion:'reduce'});const page=await context.newPage();
  for(const route of ['/','/brief/','/guide/','/who-fixes-what/','/results/','/sessions/','/neighborhoods/linwood/']){
   await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);
   const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
   assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],colorScheme+' '+width+' '+route);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,route);
   if(['/','/who-fixes-what/','/results/'].includes(route))await page.screenshot({path:artifacts+'/'+(route==='/'?'home':route.replaceAll('/',''))+'-'+width+'-'+colorScheme+'.png'});
   checks++;
  }
  await context.close();
 }
 const context=await browser.newContext();const page=await context.newPage();const outbound=[],requests=[];
 page.on('request',r=>{requests.push(r.url());if(!r.url().startsWith(base))outbound.push(r.url());});
 await page.goto(base+'/neighborhoods/linwood/');await page.locator('.pattern-link').first().click();
 assert.ok(page.url().includes('/brief/#context=linwood-'));assert.match(await page.locator('#b-evidence').inputValue(),/Source: https:\/\/neighborhoodos.org/);
 assert.match(await page.locator('#o-evidence').textContent(),/area-wide pattern/);
 await page.locator('#b-what').fill('PRIVATE-CHECK-8821');await page.locator('#brief-use-context').click();assert.equal(await page.locator('#b-what').inputValue(),'PRIVATE-CHECK-8821');assert.match(await page.locator('#brief-context-status').textContent(),/current answers/);
 const help=await page.locator('#brief-help').getAttribute('href');assert.ok(help.includes('Housing'));
 await page.locator('.language-menu summary').click();for(const a of await page.locator('.language-options li a').all())assert.ok(!(await a.getAttribute('href')).includes('PRIVATE-CHECK'));
 assert.ok(!page.url().includes('PRIVATE-CHECK'));assert.ok(!(await page.evaluate(()=>JSON.stringify({...localStorage}))).includes('PRIVATE-CHECK'));assert.deepEqual(outbound,[]);assert.ok(!requests.some(u=>u.includes('PRIVATE-CHECK')));
 await page.locator('#b-clear').click();assert.equal(await page.locator('#b-what').inputValue(),'');assert.equal(await page.locator('#brief-help').getAttribute('href'),'/resources/');
 await page.goto(base+help);assert.equal(await page.locator('#resource-category').inputValue(),'Housing');assert.ok(await page.locator('.resource:visible').count()>0);
 await page.goto(base+'/brief/#context=unknown-script');assert.equal(await page.locator('#b-evidence').inputValue(),'');
 await page.goto(base+'/guide/');await page.locator('#guide-search').fill('manual');assert.equal(await page.locator('#guide-entries .guide-entry:visible a[href^="/guide/manual-"]').count(),4);await page.locator('#guide-search').fill('zz-no-match');assert.match(await page.locator('#guide-count').textContent(),/No matching/);
 await page.goto(base+'/');await page.locator('.program-menu summary').click();assert.equal(await page.locator('.program-menu nav').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('.program-menu').getAttribute('open'),null);
 await context.close();console.log(checks+' layout/accessibility checks passed; public context, overwrite protection, resource filtering, guide search, menu keyboard handling, and private-input isolation passed.');
}finally{await browser.close();}
