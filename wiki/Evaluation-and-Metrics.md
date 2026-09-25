# Evaluation and Metrics

Measure outcomes, not activity. Three questions decide whether the program is working:

1. **Did stuck problems actually get resolved, and how long did it take?**
2. **Can people spot an AI error better after training than before?**
3. **Are peer helpers still with the program six months later?**

Never collect metrics that identify individuals. Every measure below works with anonymous or place-based records. See the [Threat Model](Threat-Model.md).

## 1. Problems resolved, and time to resolution

Tracked in the public problem log, which lists places and institutions, never people.

| Field | Example |
|---|---|
| Problem (place + issue) | Streetlight out, 75th and Wornall |
| Date first raised at a clinic | 2026-11-04 |
| Next step and who took it | 311 request filed (case #…) |
| Status | Open / Moved / Resolved / Stuck, with reason |
| Date resolved | 2026-12-01 |
| Evidence of resolution | 311 case closed and neighbor confirmed light is on |

**Report:** number of problems raised; number resolved; median days from first clinic to resolution; number stuck, grouped by why (wrong authority, no response, needs policy change). "Resolved" means a neighbor confirms the fix, not only that a case was closed.

Follow up on every problem at 30, 60, and 90 days. Problems raised late in a cohort are carried into the next one's log.

## 2. Spotting AI errors, before and after

The anonymous [quick check](https://neighborhoodos.org/kit/#h-check) in the facilitator kit, handed out at the start of Learn 1 and the end of Learn 3.

- Three scenarios (an invented code section, a voice-clone scam call, pasting a lease into a chatbot), then three chatbot answers to mark as trust it / check first / don't act on it: one true, one with an invented code section, one giving dangerous legal advice.
- Score: share of the five error items answered safely, and whether anyone rejects the true answer outright. Both matter; the goal is judgment, not reflexive distrust.
- The sheet is the same before and after, so expect some gain from familiarity. If a cohort wants a stricter measure, swap in new items for the "after" sheet.

**Report:** average scores before and after, for the group only. Use paper with no names, or an anonymous form with no login. Match before/after at the group level, not by person.

## 3. Peer helpers retained at six months

Peer helpers are graduates who co-facilitate, staff open hours, or help at clinics, and are paid for it (see [Roles and Staffing](Roles-and-Staffing.md)).

**Report:** number of peer helpers recruited; number still active 6 months after their first paid shift; hours contributed; and, from a short exit conversation, why anyone stopped. The program lead tracks this from the stipend roster the paying partner already keeps; no separate list is created.

## Supporting counts (context, not goals)

| Measure | Planning target |
|---|---|
| Learn sessions / Solve clinics held | 3 / 2 per cohort |
| Attendance per session | 12-25 (headcount, not names) |
| Returning participants | 30%+ attend two or more (show of hands) |
| Build candidate | 1 scoped, or set aside with a written reason |

## Quick feedback at every session (anonymous)

1. How useful was today? (1-5)
2. One thing you'll do differently this week.
3. What should we change?
4. Would you come back / bring someone? (yes / maybe / no)

## The decision memo (two pages, end of each cohort)

1. **Outcomes:** problems resolved and median days; AI-error check before and after; peer helper retention (at 6 months once available)
2. What people said (3-5 quotes, with permission, no names)
3. Problems that got stuck, and why
4. Safety review: any data collected, any requests over the line, any changes to the Threat Model
5. Recommendation: continue as is / change X / stop
