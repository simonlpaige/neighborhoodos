# Wedge: Home Maintenance (West Waldo, KCMO)

First NeighborhoodOS pilot. Target: homeowners in West Waldo who keep postponing fixable problems because they can't find a trustworthy contractor or the cash-to-comfort ratio doesn't work.

**Scope: owner-occupied homes only. Rental properties are out of scope for this wedge.**

---

## The specific pain

Three variations show up on every block in older KC neighborhoods:

1. **The frozen homeowner.** Something breaks. They don't know who to call. They Google contractors and freeze. The problem compounds until it becomes an emergency.
2. **The fleeced neighbor.** Someone takes the gamble on a contractor pulled from a sketchy flyer or a Google result. Overcharged, poor work, no recourse.
3. **The everyone-doing-it-alone street.** Five neighbors on the same block need the same three things done. None of them know it. They each hire separately, at full markup, on different weekends.

Tools we're building for this wedge address one or more of those.

---

## V1 goals (first 90 days)

- **Neighbor-vetted contractor list.** Residents recommend people who did right by them. Each entry has at least two independent recommendations from named neighbors before it's "trusted."
- **"Come look at it" first-pass diagnostic.** A handful of retired tradespeople and capable homeowners who will walk over and tell you if it's a $20 fix or a $2,000 fix, before you call anybody.
- **Shared tool library.** Pressure washer, extension ladder, tile saw, snake. Stop 30 neighbors from each owning one that lives in a garage 363 days a year.
- **Block-level repair coordination.** One month a year where we batch the same job (gutter cleaning, fence staining) across willing neighbors and negotiate one price.

Explicit non-goals for v1: licensing, insurance validation, payment processing, ratings algorithms, nationwide anything, anything that needs a lawyer to ship.

---

## Data backbone (already live)

This wedge reuses code originally written for the West Waldo civic data pilot. It pulls from KC Open Data: 311 service requests, building permits, property violations, dangerous buildings. Useful because: permit-level data + violation data tells us which blocks and which problems are underserved in real time, and the 311 feed catches the "frozen homeowner" cases that leak into city complaints.

### Commands

```bash
cd neighborhoodos/wedges/home-maintenance
npm install

node fetch-all.js    # pull 311 + permits + crime + violations + budget from KC Open Data
node ingest-all.js   # load into SQLite
node digest.js       # generate weekly digest (markdown)
node ask.js "What's the most common home maintenance request this month?"
```

Full command list: [`LEGACY-README.md`](./LEGACY-README.md).

---

## What "working" looks like at 90 days

- 20+ households in West Waldo know this exists and have used it at least once.
- 10+ contractors vetted by at least 2 neighbors each.
- At least 3 "prevented a disaster" stories we can point at by name (with permission).
- At least one coordinated block-level job where 4+ houses saved meaningful money vs. hiring separately.

If those numbers aren't hit at 90 days, we rotate the wedge. The platform stays; the wedge changes.

---

## What "not working" looks like

- Nobody signs up for the vetted list.
- Contractors game the recommendation system.
- The tool library becomes a storage problem nobody wants to solve.
- The listening phase revealed a sharper pain we should be solving instead.

Any of those triggers a retro and a wedge rotation. No shame.

---

## How to contribute

Right now this is one person in one neighborhood. Useful help:

- Live in West Waldo? Come to the next neighbors meeting and say hi.
- Can fix things? We want to know you.
- Got recommendations for contractors who did right by you? Those are the seed of the whole thing.
- Software help? Open an issue on [GitHub](https://github.com/simonlpaige/neighborhoodos-homecare) or [Codeberg](https://codeberg.org/AlphaWorm/neighborhoodos-homecare).
