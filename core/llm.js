// neighborhoodos/core/llm.js
// Small helper for calling a LOCAL model (Ollama) from a NeighborhoodOS tool.
//
// It bakes in the program's rules so each tool doesn't reinvent them:
//   - answers must be grounded in the sources you pass in
//   - every answer carries its source links back to the caller
//   - no legal / medical advice; say "not in the record" instead of guessing
//   - requests go to a local host by default, never a cloud API
//   - obvious personal data (emails, phone numbers, SSNs) is stripped from the
//     question before it leaves the tool, and nothing is logged
//
// Usage:
//   import { askLocal } from '../core/llm.js';
//   const { answer, sources } = await askLocal({
//     question: 'Who handles streetlight outages?',
//     sources: [{ title: 'KC 311 service requests', url: 'https://data.kcmo.org/...', text: '...' }]
//   });

const DEFAULT_HOST = process.env.NOS_LLM_HOST || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.NOS_LLM_MODEL || 'qwen2.5:7b';

export const SYSTEM_RULES = `You are a neighborhood civic helper. You explain public information in plain, kitchen-table language.
Rules you must follow:
- Use ONLY the numbered sources provided. Cite them like [1], [2].
- If the answer is not in the sources, say: "That isn't in the public record I have." Then suggest who to ask.
- Never give legal, medical, or financial advice. Suggest a real person or office instead.
- Never guess names, phone numbers, section numbers, dates, or deadlines.
- Never make or recommend decisions about specific people.
- Keep answers short: a few sentences, then the next step a person could take.`;

const PII_PATTERNS = [
  [/\b\d{3}-\d{2}-\d{4}\b/g, '[removed SSN]'],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[removed email]'],
  [/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[removed phone]'],
  [/\b(?:\d[ -]?){13,19}\b/g, '[removed card number]']
];

export function redact(text = '') {
  let out = String(text);
  for (const [re, rep] of PII_PATTERNS) out = out.replace(re, rep);
  return out;
}

export function isLocalHost(host) {
  try {
    const h = new URL(host).hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '::1' ||
      h.startsWith('192.168.') || h.startsWith('10.') || h.startsWith('100.') || // LAN / Tailscale
      h.endsWith('.local') || h.endsWith('.ts.net');
  } catch { return false; }
}

export function buildMessages(question, sources) {
  const block = sources.map((s, i) =>
    `[${i + 1}] ${s.title || 'Source'}${s.url ? ` (${s.url})` : ''}\n${String(s.text || '').slice(0, 4000)}`
  ).join('\n\n');
  return [
    { role: 'system', content: SYSTEM_RULES },
    { role: 'user', content: `Sources:\n${block || '(none provided)'}\n\nQuestion: ${redact(question)}` }
  ];
}

export async function askLocal({
  question,
  sources = [],
  model = DEFAULT_MODEL,
  host = DEFAULT_HOST,
  numCtx = 8192,
  allowRemoteHost = false,
  fetchImpl = globalThis.fetch
} = {}) {
  if (!question || !String(question).trim()) throw new Error('A question is required.');
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error('askLocal requires at least one source. NeighborhoodOS tools answer from the record, not from memory.');
  }
  if (!allowRemoteHost && !isLocalHost(host)) {
    throw new Error(`Refusing to send data to non-local host ${host}. Pass allowRemoteHost: true only with data-steward sign-off.`);
  }

  const res = await fetchImpl(`${host.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      options: { num_ctx: numCtx, temperature: 0.2 },
      messages: buildMessages(question, sources)
    })
  });
  if (!res.ok) throw new Error(`Local model returned HTTP ${res.status}. Is Ollama running at ${host}?`);
  const data = await res.json();
  const answer = data?.message?.content?.trim() || '';

  return {
    answer,
    sources: sources.map((s, i) => ({ n: i + 1, title: s.title || 'Source', url: s.url || null })),
    model,
    reviewed: false // a human must review before anything is sent or acted on
  };
}
