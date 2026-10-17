// One-time content migration for the October 2026 handoff, retained for provenance.
import fs from 'node:fs';
const files=fs.readdirSync('wiki').filter(f=>f.endsWith('.md')).map(f=>'wiki/'+f).concat(['README.md','content/original-kit.html']);
for(const file of files){let s=fs.readFileSync(file,'utf8');s=s.replaceAll('[simon@simonlpaige.com](mailto:simon@simonlpaige.com)','[KC Digital Drive](https://www.kcdigitaldrive.org/contact/)').replaceAll('the host library','the host organization').replaceAll('The host library','The host organization').replaceAll('through the library','through the host organization').replaceAll('at the library','at LAMP').replaceAll('the library holds it','the host organization holds it').replaceAll('If the library keeps','If the host organization keeps').replaceAll('when hosted by the library','when donated by the host (confirm)').replaceAll('a monthly Solve night at the library','a monthly Solve night at LAMP').replaceAll('1801 Linwood Blvd..','1801 Linwood Blvd.');fs.writeFileSync(file,s);}
const write=(file,s)=>fs.writeFileSync('wiki/'+file,s.trim()+'\n');
write('Home.md',`# NeighborhoodOS Program Guide

**A KC Digital Drive program. Starting in Linwood, with a model other neighborhoods can reuse.**

KC Digital Drive adoption was confirmed by Simon L. Paige on October 17, 2026. Simon remains the site administrator and advisor. The program does not depend on him to run recurring sessions.

Neighbors learn to check AI answers, then use Solve clinics to turn a stuck civic problem into a sourced one-page brief. At LAMP, the Learn track should use DSSC's existing digital skills workshops rather than duplicate them.

## Start with your task

- [Start here for partners](Start-Here-for-Partners.md)
- [Program design](Program-Design.md) and [session plans](Session-Plans.md)
- [Printable facilitator kit](https://neighborhoodos.org/kit/)
- [Budget](Budget-and-Hardware.md) and [grant kit](Grant-Kit.md)
- [Roles](Roles-and-Staffing.md) and [partner agreement worksheet](Partner-MOU.md)
- [Safety doctrine](Safety-Doctrine.md) and [threat model](Threat-Model.md)
- [Data sources and methods](Data-Sources.md)
- [Current gaps and roadmap](Known-Gaps-and-Roadmap.md)

## What is ready

The self-paced lesson, private brief builder, print kit, on-site guide, sourced resource directory, and dated public-data snapshots can be used now. Session dates, stipend funding, named program roles, partner agreements, and reviewed clinic results remain to be confirmed.

Lykins / Northeast and Hickman Mills are expansion candidates. Their public-data pages do not establish a relationship or consent to run a program.

Program questions: [Contact KC Digital Drive](https://www.kcdigitaldrive.org/contact/). Website administration: Simon L. Paige.
`);
write('Partners.md',`# Partners and Reference Resources

## Confirmed program owner: KC Digital Drive

Adoption was confirmed by founder Simon L. Paige on October 17, 2026. KCDD leads program delivery; Simon remains site administrator and advisor. KCDD should name a program lead and a separate data steward before a cohort begins.

The [Digital Services & Support Center at LAMP](https://www.kcdigitaldrive.org/project/dsslampcampus/) is at **1801 Linwood Blvd, Kansas City, MO 64109**. Parking is on Woodland; entry is on Linwood. Confirm room booking, access, and times before scheduling.

## Build on DSSC

Use DSSC's existing digital skills learning as the Learn track. NeighborhoodOS adds the Solve clinic format, local public-source work, and a private problem brief. Do not advertise a second competing AI-literacy course. The [KCDD calendar](https://www.kcdigitaldrive.org/events/) remains the event source; individual event pages link to registration when offered.

## References, not confirmed agreements

- Kansas City Documenters / The Beacon: link to human-reported meeting notes or the official record. No unreviewed AI meeting summaries. No partnership is asserted.
- CivicAI: evaluate available curriculum and reuse terms before adoption. No agreement or guaranteed module availability is asserted.
- UMKC Center for Neighborhoods, UMKC SBDC, HEMP, Trust Neighborhoods, and neighborhood associations: potential collaborators or independent referrals. A listing in the directory is not a partnership.
- Lykins / Northeast and Hickman Mills: possible next program areas; local agreement, a host, and funding are prerequisites.
- A public library can be a second venue or an eligible library-grant lead. It is not described as the current program owner.

Keep proposed, contacted, in conversation, agreed, and operating distinct. Record a change only after the relevant organization confirms it.

Program inquiries: [KCDD's official contact page](https://www.kcdigitaldrive.org/contact/). A dedicated program inbox has not been supplied; do not invent one.
`);
write('Start-Here-for-Partners.md',`# Start Here for Partners

NeighborhoodOS is free, practical AI learning plus clinics for stuck civic problems. It is a KC Digital Drive program, beginning at the LAMP campus. This guide can be adapted by another neighborhood or host.

## Before scheduling

1. Name a program lead and a separate data steward.
2. Agree the participating neighborhood with its local association or trusted connectors. A public-data dashboard does not establish participation.
3. Confirm a room, step-free access, interpretation needs, and practical visiting instructions. At LAMP: 1801 Linwood Blvd, Kansas City, MO 64109; park on Woodland and enter on Linwood.
4. Confirm the stipend payer and budget. Plan $30 per 90-minute participant session and $20/hour for peer helpers. Do not advertise payment until the session is funded.
5. Use existing DSSC classes for Learn, then arrange two Solve clinics. A library can be a second venue.
6. Adopt the [Safety Doctrine](Safety-Doctrine.md). Keep private resident information out of public tools and logs.

## A 90-day cohort, after setup

| Period | Work | Evidence |
|---|---|---|
| Days 1–30 | Existing digital-skills learning, outreach through paid connectors, baseline voluntary AI-error check | Aggregate headcounts and anonymous check totals |
| Days 31–60 | Finish learning; first Solve clinic | Resident-owned briefs, public-source links, named next steps |
| Days 61–90 | Second Solve clinic; check follow-through; decide whether a small tool is justified | Reviewed outcomes and a continue/change/stop decision |

The start date is set after room, staffing, and money are confirmed. No February 2027 cohort is announced by this planning guide.

## Useful materials

[Session plans](Session-Plans.md), [facilitator guide](Facilitator-Guide.md), [budget](Budget-and-Hardware.md), [measurement plan](Evaluation-and-Metrics.md), [partner worksheet](Partner-MOU.md), and [print kit](https://neighborhoodos.org/kit/).

## Other neighborhoods

Lykins / Northeast and Hickman Mills are worked expansion candidates, not confirmed partners. Agree a local host, language needs, resident invitation route, and official boundary coverage before adding sessions. KCK needs a separate data connector and local invitation.

[Contact KC Digital Drive](https://www.kcdigitaldrive.org/contact/) to discuss program delivery.
`);
write('Known-Gaps-and-Roadmap.md',`# Known Gaps and Roadmap

Status: October 17, 2026. Availability is separate from adoption, participation, funding, and outcomes.

## Included in the website refresh

- Confirmed KCDD program ownership, with Simon as site administrator and advisor.
- LAMP/DSSC host information and one address; library as an optional second venue.
- Shared accessible design, local fonts, sessions, resources, small business, funder materials, and on-site guide.
- Browser-only brief builder and existing learning exercises retained.
- Official neighborhood polygons, dated 311 snapshots, separate canceled statuses, closure medians, trends, and infrastructure-only block-level stuck lists.
- One neighborhood config, sourced directory records, a Spanish lesson, print views, and a downloadable evidence pack.

## Delivery and handoff decisions still needed

| Decision | Owner | Status |
|---|---|---|
| Named program lead and separate data steward | KCDD | Assign before cohort |
| Shared program inbox | KCDD | Not supplied; use official contact page |
| Room, clinic dates, stipend funding, language and access arrangements | KCDD program lead | Not confirmed |
| Lykins / Northeast and Hickman Mills participation | Local hosts with KCDD | Candidates only |
| Signed partner agreements and support letters | KCDD and each partner | Not supplied |
| Reviewed clinic playbooks and results | Data steward and facilitators | Await cohort and human review |
| Grant eligibility, deadlines, applications | KCDD leadership | Research and application work; not submitted by website update |
| Repo/domain ownership | Simon and KCDD | Simon remains site administrator. No transfer performed |
| Formal content license and signed permission letter | Simon and KCDD | Pending explicit license decision |
| Aggregate visitor analytics | Data steward and site administrator | Not activated; select host, retention, and privacy terms first |

## Next data work

Dangerous-building, permit, and Land Bank layers need a separate publication review before inclusion. Meetings currently link to official records and Documenters; no unreviewed AI summaries. A service navigator waits until enough human-reviewed playbooks exist. No resident accounts, governance deployment, or AI hardware is part of this release.

Directory sources need periodic content review, not only an HTTP check. Entries older than six months are flagged by the site audit. A one-page print layout is available; use the browser's Save as PDF option. Exported monthly archival PDFs are future operations work.
`);
write('Grant-Kit.md',`# Grant Kit

## Organization and program description

NeighborhoodOS is a KC Digital Drive program that combines practical digital-skills learning with civic problem-solving clinics. It begins at the Digital Services & Support Center at LAMP, 1801 Linwood Blvd, Kansas City, MO 64109. Simon L. Paige founded the project and remains site administrator and advisor.

## Need statement

Residents face confusing public systems and AI answers that can sound authoritative while being wrong. The program teaches checking original sources and protecting private information, then helps neighbors turn a stuck issue into an evidence-backed brief and a concrete next step. Public 311 data can identify reported issues worth discussing; it cannot establish resident need, identity, or program impact by itself.

Use the current official-boundary [Linwood / LAMP snapshot](https://neighborhoodos.org/neighborhoods/linwood/) with its date and methodology. Do not reuse the older handoff report's 15-neighborhood bounding-box statistics as if they describe the new area.

## Logic model

| Inputs | Activities | Outputs | Outcomes |
|---|---|---|---|
| Accessible room, facilitator, separate data steward, trusted connectors, stipend funding | Existing digital-skills classes, two Solve clinics, source verification, peer-helper practice | Aggregate attendance, completed resident-owned briefs, documented next steps, reviewed materials | Improved AI-error spotting, follow-through, documented problem resolution, peer helpers retained at six months |

## Measures and limits

- Learning: voluntary anonymous before/after AI-error checks, reported as aggregate counts and denominators. Do not track individuals.
- Follow-through: reviewed briefs with a dated next step; report follow-up availability and unresolved cases.
- Resolution: count only where evidence and a human reviewer support the conclusion. A canceled city request is not a resolved program problem.
- Capacity: paid peer helpers invited back, with voluntary six-month follow-up.
- Reach: session headcounts. Website visitor analytics are not enabled in this release; do not claim web reach numbers.

## Budget narrative

The planning range is roughly $7,000–$16,000 for a 90-day cohort. Support facilitation, resident time, paid connectors, food, printing, and accessibility. Participant time is budgeted at $30 per 90-minute session. Hardware is not required. Reconcile the line items and get quotes before an application; upper and lower line-item bounds are not a fixed bid.

## Evidence pack contents

Program description, logic model and measures, budget, safety doctrine, threat model, roles, partner agreement worksheet, current data methods, and aggregate snapshots. No partner letters, signed agreements, grant awards, or cohort outcomes are supplied yet.

## Support-letter outline

An authorized partner may describe the local need, the specific contribution it can commit, the dates and staff capacity, its data responsibilities, and who can sign. Do not generate a signed letter or claim a commitment on a partner's behalf.

[Official funding research leads](Funding-Research.md). [Contact KCDD](https://www.kcdigitaldrive.org/contact/) for application ownership and giving information.
`);
write('Partner-MOU.md',`# Partner Agreement Worksheet

Planning worksheet for KCDD and a host. It is not an executed agreement or a statement that any partner has committed.

| Decide together | Record before scheduling |
|---|---|
| Host and neighborhood | Organization, local participation agreement, room and address |
| Roles | Program lead, separate data steward, facilitator, paid connectors |
| Dates and access | Session dates, room booking, step-free entry, interpretation and other accommodations |
| Money | Stipend payer, confirmed funds, rates, food, travel and materials |
| Private information | Collect nothing by default; any exception approved by the data steward; payment details stay with the payer |
| Public outputs | Places and institutions only; no household case histories; human review before publication |
| Safety | Adopt the Safety Doctrine; no automated decisions about people or unreviewed AI meeting summaries |
| Problems and cancellation | Who handles an access issue, privacy concern, funding gap or cancellation |
| Review | Authorized representatives, approval date, next check-in, and any required legal review |

Complete and approve this through each organization's normal process. A blank worksheet does not establish a partnership.
`);
write('Funding-Research.md',`# Funding Research

The handoff report names funding leads. This page links to their official program sources without representing any application as submitted, any deadline as verified, or any award as secured. KCDD leadership owns eligibility checks and applications.

| Lead | Official source | Next decision |
|---|---|---|
| Missouri Neighborhood Assistance Program | https://ded.mo.gov/programs/community/neighborhood-assistance-program | Confirm the current round, deadline, tax-credit rules, and fit directly with DED |
| Library-led federal grants | https://www.imls.gov/ | Ask a qualified library partner to confirm current notices, eligibility, and program availability |
| Federal digital-equity funding | https://broadbandusa.ntia.gov/ | Confirm program authority and current notices before budgeting expected income |
| Kauffman Foundation | https://www.kauffman.org/funding/grants/ | Check the published round and workforce or business fit |
| Anthropic nonprofit support / fellowships | https://www.anthropic.com/ | Confirm whether a host program exists, its official application, plan requirements, and terms; report numbers are not independently verified |
| OpenAI Foundation | https://openaifoundation.org/ | Check current programs and application notices; no next round is assumed |
| Google.org | https://www.google.org/ | Confirm current opportunities and any government-partner requirement |
| Greater Kansas City Community Foundation | https://www.growyourgiving.org/ | Confirm open funds, eligibility, and who should apply |
| KC Digital Inclusion Fund | https://www.kcdigitaldrive.org/ | Ask KCDD about current partner eligibility and conflict-of-interest rules |

## Application checklist

Confirm the notice date, eligibility, deadline and time zone, funding restrictions, authorized applicant, matching requirements, stipend eligibility, and evidence needed. Save the official notice with the application. Treat the handoff report's dates and amounts as research leads until verified.

Do not publish a claim that a grant is open based on an earlier report. No applications, subscriptions, outreach, or paid AI-plan enrollment are performed by this website release.
`);
// Preserve useful curriculum and technical material, correcting the host and role story.
let p=fs.readFileSync('wiki/Program-Design.md','utf8').replace('- **Host:** a public library branch (in Linwood, the LAMP campus at 1801 Linwood Blvd.).','- **Host:** KC Digital Drive’s Digital Services & Support Center at LAMP, 1801 Linwood Blvd, Kansas City, MO 64109. A library may be a second venue.').replace(/- \*\*Curriculum:\*\*[^\n]+/,'- **Curriculum:** build Learn around DSSC’s existing digital-skills workshops. Use the self-paced lesson as a supplement. Evaluate outside curricula and reuse terms before adoption.').replace(/\| \*\*Learn\*\*[^\n]+/,'| **Learn** | 3 learning touchpoints | Use existing DSSC workshops; add local safety, privacy, and source-checking practice | No |');
fs.writeFileSync('wiki/Program-Design.md',p);
let roles=fs.readFileSync('wiki/Roles-and-Staffing.md','utf8');roles=roles.replace(/## The original author[\s\S]*/,'## Program owner and site administrator\n\nKC Digital Drive owns the program. Simon L. Paige is founder, site administrator, and advisor. He may join kickoff or check-in conversations, but is not the recurring facilitator. KCDD should assign a program lead and a separate data steward; names are not yet supplied. Program inquiries go through [KCDD’s official contact page](https://www.kcdigitaldrive.org/contact/).\n');fs.writeFileSync('wiki/Roles-and-Staffing.md',roles);
let faq=fs.readFileSync('wiki/FAQ.md','utf8').replace(/\*\*Why a library\?\*\*\r?\n[^\n]+/,'**Where does it happen?**\nKC Digital Drive’s Digital Services & Support Center at the LAMP campus is the Linwood program home: 1801 Linwood Blvd, Kansas City, MO 64109. Libraries can be additional venues. Check the sessions page for confirmed dates.');fs.writeFileSync('wiki/FAQ.md',faq);
let budget=fs.readFileSync('wiki/Budget-and-Hardware.md','utf8').replace('written in September 2026','reviewed for planning in October 2026').replace(/## Funding[\s\S]*/,'## Funding\n\nKCDD leads funding for the LAMP program. A library can be an eligible lead for library-specific grants; it is not the default program owner. Use the [Grant Kit](Grant-Kit.md) and [Funding Research](Funding-Research.md). Verify current notices, deadlines, and terms before applying. No award or stipend funding is claimed by this planning budget.\n');fs.writeFileSync('wiki/Budget-and-Hardware.md',budget);
let threat=fs.readFileSync('wiki/Threat-Model.md','utf8').replace('*Written September 2026.','*Updated October 17, 2026.').replace(/\| \*\*Website visits\*\*[^\n]+/,'| **Website visits** | GitHub hosts the site and can see visitor IP addresses. Fonts are served from this same site. No analytics or tracking cookies are enabled. | Hosting-provider legal process and policies | Hosting-provider policies |').replace(/\| \*\*Linwood dashboard\*\*[^\n]+/,'| **Neighborhood dashboards** | A scheduled repository workflow fetches city data and publishes only aggregates and allowlisted infrastructure blocks. Visitor browsers read files from this site; they do not query DataKC. No raw household rows, free text, coordinates, or resident names are stored in snapshots. | Already public aggregate files; host policies apply to site access | Dated aggregate snapshots remain in Git history |').replace(/\| \*\*Optional follow-up list\*\*[^\n]+/,'| **Optional follow-up list** | KCDD or the hosting partner, with explicit opt-in, under its own privacy and records rules. NeighborhoodOS does not hold it. No list exists on this website. | Process served on the hosting organization; confirm applicable rules before collection | Delete at cohort end (90 days) or sooner on request, subject to the host’s approved policy |').replace(/\| \*\*Email to the program contact\*\*[^\n]+/,'| **Contact requests** | KCDD’s official contact channel follows KCDD’s own privacy and retention terms. Site-administration email is held by the administrator’s mail provider. Avoid private case details. | Provider or organization legal process | Organization or administrator’s retention policy; no unsupported deletion promise |');
threat+='\n## Directory and analytics\n\nThe directory lists organizations and public source links, not private resident contacts or named neighborhood leaders. Source availability checks are automated; service details need human review. No aggregate visitor analytics has been enabled. Any future analytics needs a named operator, purpose, fields, retention, and data-steward approval before activation.\n';fs.writeFileSync('wiki/Threat-Model.md',threat);
let handoff=fs.readFileSync('wiki/Handoff-and-Licensing.md','utf8');handoff+='\n## October 17, 2026 update\n\nKC Digital Drive adoption is confirmed. Simon L. Paige remains site administrator and advisor; repository and domain ownership have not been transferred. Use KCDD’s public contact page until a dedicated program inbox is supplied. Formal non-code licensing and a signed permission letter remain decisions to record explicitly; no license grant is silently changed by the website release.\n';fs.writeFileSync('wiki/Handoff-and-Licensing.md',handoff);
let data=fs.readFileSync('wiki/Data-Sources.md','utf8');data+='\n## October 2026 public website snapshots\n\nThe public website uses official DataKC neighborhood polygons (`vq6h-tqrf`) and 311 records (`d4px-6rwg`). `data/neighborhoods.json` names exact polygon membership. Linwood / LAMP groups Key Coalition and four Ivanhoe areas; Lykins is not all of Northeast; Hickman Mills uses Hickman Mills and Hickman Mills South. Neighborhood coverage does not imply association consent or participation.\n\nSnapshots cover requests opened in the trailing 365 days. The oldest-open metric excludes older cases. Canceled and duplicate statuses are distinct from resolved; status case is normalized. Closure medians use resolved records with a closure date and nonnegative duration, with local sample counts and a matched citywide window. Open cases are excluded; closed-only duration does not predict waiting time. The chart shows the last 12 calendar months with a partial final month. Unlocated city records cannot enter polygon counts.\n\nRaw rows exist only in the refresh process memory. Published JSON contains aggregates and a short allowlist of public-infrastructure issues rounded to a 100-block. Household complaint locations, names, free text, coordinates, animal-service rows, and encampment rows never enter published output. No property layers or AI meeting summaries are published.\n\nThe city feed can lag; show both latest city record date and snapshot preparation date. If the snapshot is more than seven days old, the website warns and links to the official source. Failed refreshes do not overwrite snapshots with empty values. Source: https://data.kcmo.org/d/d4px-6rwg and https://data.kcmo.org/d/vq6h-tqrf.\n';fs.writeFileSync('wiki/Data-Sources.md',data);
let sessions=fs.readFileSync('wiki/Session-Plans.md','utf8');sessions=sessions.replace(/^# .+\r?\n/,'# Session Plans\n\nOctober 2026 delivery note: at LAMP, map these learning objectives onto DSSC’s existing workshops before scheduling. Do not run a duplicate AI-literacy course. The small-business variant uses public business FAQs or checklists, never customer records or payroll. Confirm funded stipends and accommodations in each session listing. These are facilitator plans, not announced dates.\n');fs.writeFileSync('wiki/Session-Plans.md',sessions);
let launch=fs.readFileSync('wiki/Launching-a-New-Neighborhood.md','utf8').replace(/The site's \[30-day launch playbook\][^\n]+/,'The older 30-day software playbook has been retired. Use the on-site [program guide](https://neighborhoodos.org/guide/) and the 90-day cohort plan.');launch+='\n## Worked expansion candidates\n\nLykins / Northeast: start with the city’s Lykins polygon, a local host invitation, and confirmed English/Spanish access needs. Do not label this all of Northeast. Hickman Mills: begin with the two named city polygons in the config, then agree the coverage and room with local organizations. Both are candidates, not confirmed partner commitments.\n';fs.writeFileSync('wiki/Launching-a-New-Neighborhood.md',launch);
let readme=fs.readFileSync('README.md','utf8').replace('**Wiki: [start here](wiki/Home.md)**','**Program guide: [start here](https://neighborhoodos.org/guide/)**').replace(/- \*\*Out of a library\.\*\*[^\n]+/,'- **At LAMP.** A KC Digital Drive program at its Digital Services & Support Center, 1801 Linwood Blvd, Kansas City, MO 64109. Learn uses existing DSSC workshops; Solve adds clinic practice.').replace('- **Partnered for meetings.**','- **Source-linked for meetings.**');readme+='\n## Website development and release\n\nKC Digital Drive owns the program; Simon L. Paige remains site administrator and advisor. Program contact uses KCDD’s official contact page; technical issues may be sent to Simon. No repo/domain transfer is implied.\n\nThe static site is generated from `scripts/pages.mjs`, the original interactive lesson/kit fragments in `content/`, `wiki/`, and sourced JSON in `data/`. Run `npm run build`, `npm run test:web`, and `npm run audit:web`. Live data: `npm run refresh:data`. Directory/calendar sources and fonts: `node scripts/refresh-sources.mjs` (not part of normal build). The nightly workflow refreshes calendar and aggregate snapshots, then builds and publishes the same static pages. No accounts or resident data storage are part of the public site.\n';fs.writeFileSync('README.md',readme);
console.log('Updated handoff content and preserved pending ownership, licensing, and partner decisions.');
