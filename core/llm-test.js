// Tests for core/llm.js using a fake fetch (no model or network needed).
import { askLocal, redact, isLocalHost, buildMessages } from './llm.js';

let passed = 0, failed = 0;
async function t(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) { console.log(`  ✗ ${name}: ${e.message}`); failed++; }
}
const assert = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };

const src = [{ title: '311 guide', url: 'https://example.org/311', text: 'Streetlights are reported through 311.' }];
let captured = null;
const fakeFetch = async (url, opts) => { captured = { url, body: JSON.parse(opts.body) };
  return { ok: true, json: async () => ({ message: { content: 'Report it through 311 [1].' } }) }; };

console.log('\ncore/llm.js');
await t('redacts SSN, email, phone', () => {
  const r = redact('me 123-45-6789 a@b.com 816-555-1212');
  assert(!r.includes('123-45-6789') && !r.includes('a@b.com') && !r.includes('555-1212'), r);
});
await t('local host detection', () => {
  assert(isLocalHost('http://localhost:11434')); assert(isLocalHost('http://100.64.1.2:11434'));
  assert(!isLocalHost('https://api.example.com'));
});
await t('refuses remote host by default', async () => {
  let threw = false; try { await askLocal({ question: 'x', sources: src, host: 'https://api.example.com', fetchImpl: fakeFetch }); } catch { threw = true; }
  assert(threw);
});
await t('requires sources', async () => {
  let threw = false; try { await askLocal({ question: 'x', sources: [], fetchImpl: fakeFetch }); } catch { threw = true; }
  assert(threw);
});
await t('sends redacted question with numbered sources and returns citations', async () => {
  const out = await askLocal({ question: 'My number is 816-555-1212, who fixes lights?', sources: src, fetchImpl: fakeFetch });
  assert(captured.url.endsWith('/api/chat'));
  const user = captured.body.messages[1].content;
  assert(user.includes('[1] 311 guide') && !user.includes('555-1212'), user);
  assert(out.sources[0].url === 'https://example.org/311' && out.reviewed === false);
});
await t('system rules forbid legal advice and guessing', () => {
  const sys = buildMessages('q', src)[0].content;
  assert(/legal/.test(sys) && /Never guess/.test(sys));
});
console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed) process.exit(1);
