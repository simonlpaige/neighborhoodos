# Threat Model

One page: what data the Linwood program holds, who could force it to be handed over, and how long it's kept.

**The default is simple: NeighborhoodOS holds nothing about residents.** The best protection against a subpoena, a breach, or a bad actor is not having the data in the first place. Anything that changes this default has to be added to this page, and approved by the data steward, before it starts.

*Updated October 17, 2026. This is a plain-language planning document, not legal advice.*

## What exists, who holds it, who can compel it, how long it's kept

| Data | Who holds it | Who could compel it | How long |
|---|---|---|---|
| **Website visits** | GitHub hosts the site and can see visitor IP addresses. Fonts are served from this same site. No analytics or tracking cookies are enabled. | Hosting-provider legal process and policies | Hosting-provider policies |
| **Problem brief builder, "catch the machine" exercise** | Nobody. Runs in the visitor's browser; nothing is sent anywhere. | Nothing to compel | Gone when the tab closes |
| **Neighborhood dashboards** | A scheduled repository workflow fetches city data and publishes only aggregates and allowlisted infrastructure blocks. Visitor browsers read files from this site; they do not query DataKC. No raw household rows, free text, coordinates, or resident names are stored in snapshots. | Already public aggregate files; host policies apply to site access | Dated aggregate snapshots remain in Git history |
| **Session attendance** | Headcount only, on paper. No sign-in sheet by default. | Nothing to compel | Not kept |
| **Optional follow-up list** | KCDD or the hosting partner, with explicit opt-in, under its own privacy and records rules. NeighborhoodOS does not hold it. No list exists on this website. | Process served on the hosting organization; confirm applicable rules before collection | Delete at cohort end (90 days) or sooner on request, subject to the host’s approved policy |
| **Stipend payments** (name, mailing address, and, above a tax threshold, a tax ID) | The paying partner (library, fiscal sponsor, or grantee) through its normal payroll or vendor system. NeighborhoodOS never sees or keeps it. | Tax authorities; legal process served on the paying partner | The partner's financial-records rules, which are usually several years |
| **Solve clinic problem briefs** | The participant. Briefs are on paper and go home with the person who wrote them. | Nothing to compel from us | Theirs to keep |
| **Public problem log** | Public. Lists places and institutions, never people ("streetlight at Linwood and Prospect, 311 case #…"). | Already public | Until resolved, then archived |
| **Contact requests** | KCDD’s official contact channel follows KCDD’s own privacy and retention terms. Site-administration email is held by the administrator’s mail provider. Avoid private case details. | Provider or organization legal process | Organization or administrator’s retention policy; no unsupported deletion promise |
| **AI tools used in sessions** | The AI vendor, under the facilitator's account. Participants are told not to type personal information. | Legal process served on the vendor | Vendor's policy |
| **Meeting notes** | Kansas City Documenters / The Beacon publish them. We link, we don't copy. | Already public | Theirs |

## Who might want it, and what stops them

- **Police, immigration enforcement, or other agencies.** The [Safety Doctrine](Safety-Doctrine.md) bans sharing with them. More importantly, there is nothing to share.
- **Civil litigants** (a landlord in a dispute with a tenant who came to a clinic, for example). Briefs stay with residents; the problem log names no people.
- **Public records requests.** Anything a public library holds may be requestable. Another reason the follow-up list is optional, minimal, and short-lived.
- **Breach or a careless volunteer.** No resident database exists to leak.
- **Mission drift** (a funder or partner wanting "engagement data"). The answer is no, and this page is why.

## If someone asks for data anyway

1. Don't hand anything over informally. Ask for the request in writing.
2. Tell the data steward and the host partner the same day.
3. Tell the affected people, unless a court order forbids it.
4. Publish a note on this page that a request was received (no details that identify anyone).

## What would change this page

Turning on any of the optional software in [Later, if residents want it](Later-If-Residents-Want-It.md) (resident accounts, voting, a local AI server that residents type into) creates new data. Before any of it runs for real residents, this page gets a new row for each new kind of data, and the steward signs off.

Questions: [KC Digital Drive](https://www.kcdigitaldrive.org/contact/).

## Directory and analytics

The directory lists organizations and public source links, not private resident contacts or named neighborhood leaders. Source availability checks are automated; service details need human review. No aggregate visitor analytics has been enabled. Any future analytics needs a named operator, purpose, fields, retention, and data-steward approval before activation.
