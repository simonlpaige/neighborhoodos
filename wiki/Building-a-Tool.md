# Building a Tool

From a Problem Brief to a working, safe tool. The full curriculum is in the [Level 3 manual](../docs/Level-3-Tool-Builder.md).

## 0. Earn the right to build
- The problem came from a real Solve clinic.
- It scored at least 7/9 on the [Pilot Rubric](../docs/PILOT-RUBRIC.md) and passed the Red-Light Test.
- A human reviewer is named.

If any of these is missing, don't build yet.

## 1. Paper first
Draw every screen on paper. Test with 3-5 residents. Change it until they can use it without help.

## 2. Pick the smallest shape
In order of preference:
1. A printed guide or checklist
2. A single static web page (like `local/index.html`)
3. A page plus a small SQLite database
4. A page plus a local AI model

Most good neighborhood tools stop at 1 or 2.

## 3. Five rules for every tool
1. **Smallest wedge.** One problem, one audience.
2. **No automated actions.** The tool may draft or suggest. A human clicks send.
3. **Show the receipts.** Every fact links to its source.
4. **Isolated data.** Its own SQLite file, opened through `core/db.js`, deletable without harming anything else.
5. **Kitchen-table design.** Follow [`DESIGN.md`](../DESIGN.md).

## 4. Using a local AI model

Use `core/llm.js`. It already enforces the program's rules: answers come only from the sources you pass, citations come back with the answer, obvious personal data (SSNs, emails, phone and card numbers) is stripped from the question, requests only go to a local or private-network host unless a steward explicitly allows otherwise, and every result is marked `reviewed: false` until a person checks it.

```js
import { createSecureDatabase } from '../core/db.js';
import { askLocal } from '../core/llm.js';

const db = createSecureDatabase('./data/navigator.db');

const rows = db.prepare(`SELECT title, url, summary_text AS text
                         FROM city_codes WHERE topic = ?`).all('property_maintenance');

const { answer, sources } = await askLocal({
  question: 'My landlord won\'t fix peeling paint. What can I do?',
  sources: rows          // [{ title, url, text }]
});
// Show `answer` with `sources` as clickable links, plus a human review step.
```

Settings: `NOS_LLM_HOST` (default `http://localhost:11434`) and `NOS_LLM_MODEL` (default `qwen2.5:7b`; any model that fits your GPU). Give the model the sources; never ask it to remember facts.

## 5. Definition of done
- [ ] Passes the Red-Light Test
- [ ] All database access goes through `core/db.js`
- [ ] Every fact has a clickable source
- [ ] Works on a phone, with a keyboard, and with a screen reader
- [ ] Human review step exists for anything outbound
- [ ] Named owner and a date to reassess (toothbrush test)
- [ ] A plain-language page explains what it does and what it stores
