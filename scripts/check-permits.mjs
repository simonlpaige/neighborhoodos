import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8765';
fs.mkdirSync('artifacts/permits',{recursive:true});
const browser=await chromium.launch();let checks=0;
try{
 for(const scheme of ['light','dark']){
  for(const width of [1440,390]){
   const context=await browser.newContext({colorScheme:scheme,viewport:{width,height:1000}});
   const page=await context.newPage();
   for(const area of ['linwood','lykins','hickman-mills']){
    const expected=JSON.parse(fs.readFileSync('data/snapshots/'+area+'-permits.json','utf8'));const total=expected.total;
    await page.goto(base+'/neighborhoods/'+area+'/#building-permits');
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('.permit-metrics .metric').nth(2).locator('strong').textContent(),String(total));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,area+scheme+width);
    assert.ok((await page.locator('#building-permits').textContent()).includes('Dec 30, 2023'));
    const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
    const response=await page.request.get(base+'/data/snapshots/'+area+'-permits.json');
    assert.equal(response.status(),200);
    const snapshot=await response.json();assert.equal(snapshot.total,total);
    for(const row of snapshot.recent)assert.deepEqual(Object.keys(row).sort(),['block','issued','number','status','type']);
    if(area==='linwood')await page.screenshot({path:'artifacts/permits/linwood-'+scheme+'-'+width+'.png'});
    checks++;
   }
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('#building-permits').isVisible(),false);
   await context.close();
  }
 }
 console.log(checks+' dashboard desktop/mobile light/dark audits passed; zero axe violations; snapshot privacy and print checks passed.');
}finally{await browser.close();}
