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

```js
import { createSecureDatabase } from '../core/db.js';
const db = createSecureDatabase('./data/navigator.db');

const SYSTEM = `You translate public city information into plain language.
Always include the official source link you were given.
Never give legal advice. If a detail isn't in the provided sources,
say "That isn't in the public record I have" and give the city phone number.`;

async function explain(question, sources) {
  const res = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5:7b',            // any model that fits your GPU
      stream: false,
      options: { num_ctx: 8192 },     // keep inside VRAM
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Sources:\n${sources}\n\nQuestion: ${question}` }
      ]
    })
  });
  return (await res.json()).message.content;
}
```

Give the model the sources; don't ask it to remember facts. Show the sources next to its answer. Log nothing personal.

## 5. Definition of done
- [ ] Passes the Red-Light Test
- [ ] All database access goes through `core/db.js`
- [ ] Every fact has a clickable source
- [ ] Works on a phone, with a keyboard, and with a screen reader
- [ ] Human review step exists for anything outbound
- [ ] Named owner and a date to reassess (toothbrush test)
- [ ] A plain-language page explains what it does and what it stores
