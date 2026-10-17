import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {load} from 'cheerio';
import {translationLanguages,translationUrl,themeInit,readingRoute} from '../scripts/ui-settings.mjs';
import {readingCopy} from '../scripts/reading-copy.mjs';
test('six supported languages link only to public reading paths, with no user query or state',()=>{
 assert.equal(translationLanguages.length,6);
 for(const l of translationLanguages){const u=new URL(translationUrl('/guide/start-here-for-partners/',l.code));assert.equal(u.origin,'https://translate.google.com');assert.equal(u.searchParams.get('tl'),l.code);assert.equal(u.searchParams.get('u'),'https://neighborhoodos.org/reading/guide/start-here-for-partners/');}
 assert.throws(()=>translationUrl('/','xx'));assert.equal(readingRoute('/learn/es/'),'/reading/learn/');
});
test('reading copies strip editable controls and scripts, preserve public text, and use original canonicals',()=>{
 const html='<html><head><link rel="canonical" href="https://neighborhoodos.org/brief/"></head><body><main><p>Public guidance</p><form><label>Secret<input value="PRIVATE"></label><textarea>PRIVATE</textarea><button>Send</button></form><iframe src="https://example.com"></iframe><script>secret()</script><a href="/sessions/">Next</a></main></body></html>';
 const out=readingCopy(html,'/brief/'),$=load(out);
 assert.equal($('input,textarea,select,form,button,script,iframe').length,0);assert.ok(!out.includes('PRIVATE'));assert.match(out,/Public guidance/);assert.equal($('meta[name=robots]').attr('content'),'noindex,follow');assert.equal($('link[rel=canonical]').attr('href'),'https://neighborhoodos.org/brief/');assert.equal($('a').attr('href'),'/reading/sessions/');
});
test('initial theme follows the system and only honors valid manual choices, even with blocked storage',()=>{
 for(const [saved,dark,blocked,expected,pref] of [[null,true,false,'dark','system'],[null,false,false,'light','system'],['light',true,false,'light','light'],['dark',false,false,'dark','dark'],['invalid',true,false,'dark','system'],[null,true,true,'dark','system']]){
  const document={documentElement:{dataset:{}}};vm.runInNewContext(themeInit,{document,localStorage:{getItem(){if(blocked)throw Error('blocked');return saved;}},window:{matchMedia:()=>({matches:dark})}});assert.equal(document.documentElement.dataset.theme,expected);assert.equal(document.documentElement.dataset.themePreference,pref);
 }
});
test('appearance implementation stores only the theme and never installs a third-party translator script',()=>{
 const source=fs.readFileSync('assets/appearance.js','utf8');assert.ok(source.includes("localStorage.setItem('nos-theme',preference)"));assert.ok(!/https?:\/\//.test(source));
});
