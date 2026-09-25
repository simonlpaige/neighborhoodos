# Safety Doctrine

> We design our systems to be bad at surveillance on purpose.

This page summarizes the hard limits. The full text is [docs/BANNED-USE.md](../docs/BANNED-USE.md). Any organization using the NeighborhoodOS name is expected to adopt these limits as written.

## The hard limits

1. **No resident dossiers.** Never build histories or profiles of individual people.
2. **No predictive policing and no enforcement integration.** No hot-spot prediction; no data sharing with police, immigration, or national security systems.
3. **No monitoring of speech, protest, or organizers.** No sentiment analysis of residents, no mapping of who influences whom.
4. **No scoring people.** No risk, trust, compliance, or value scores for residents or households.
5. **No automated decisions about people.** AI may summarize and draft; humans decide who gets help, what gets escalated, what gets funded.
6. **No unreviewed AI summaries of public meetings.** Never publish an AI-generated account of a meeting that a trained person hasn't checked. Link to [Kansas City Documenters](Partners.md) notes, which are fact-checked by The Beacon, or to the official agenda and minutes.
7. **Hold nothing about residents by default.** Anything that changes this must be added to the [Threat Model](Threat-Model.md) first.

## What is encouraged

- Aggregate patterns about infrastructure and institutions (unresolved streetlights by block, response times by department).
- Tracking promises made by public officials in public meetings, using Documenters' verified notes or official records.
- Plain-language explanations of public documents, reviewed by a person before they're shared.
- Community voting with blinded, verifiable ballots (only if residents ask for it; see [Later, if residents want it](Later-If-Residents-Want-It.md)).

## How it's enforced

**In code:** `core/db.js` refuses banned tables, columns, and patterns and logs every blocked attempt to an append-only audit table. The social-media connector is off by default.

**In governance:** a named data steward, a weekly audit review, deletion requests honored, and the [Pilot Rubric](../docs/PILOT-RUBRIC.md) applied before anything new is built.

**In the room:** facilitators say these limits out loud at every Learn 3 and Build session.

## Social media

`connectors/social.js` was written early to collect neighborhood group posts. Parts of it (sentiment tags, public-page scraping) conflict with limit 3. It now runs only with `NOS_ENABLE_SOCIAL=1`. Recommended policy: leave it off. If a neighborhood group's admins *and* members explicitly opt in to sharing a topic export, a steward may enable it for topic counts only, never sentiment, never names.

## When someone asks for something over the line

Say no, point to this page, and offer the closest safe alternative (usually an aggregate view or a public-official-accountability view). Funders and city partners occasionally ask. The answer does not change.
