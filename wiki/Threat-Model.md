# Threat Model

One page: what data the Waldo program holds, who could force it to be handed over, and how long it's kept.

**The default is simple: NeighborhoodOS holds nothing about residents.** The best protection against a subpoena, a breach, or a bad actor is not having the data in the first place. Anything that changes this default has to be added to this page, and approved by the data steward, before it starts.

*Written September 2026. This is a plain-language planning document, not legal advice.*

## What exists, who holds it, who can compel it, how long it's kept

| Data | Who holds it | Who could compel it | How long |
|---|---|---|---|
| **Website visits** (neighborhoodos.org) | GitHub (hosts the site) and Google (serves the fonts) see visitors' IP addresses. NeighborhoodOS runs no analytics, no cookies, no forms. | Legal process served on GitHub or Google, not on us | Their policies |
| **Problem brief builder, "catch the machine" exercise** | Nobody. Runs in the visitor's browser; nothing is sent anywhere. | Nothing to compel | Gone when the tab closes |
| **Waldo dashboard** | The visitor's browser asks DataKC (the City) directly. The City's data host sees the IP address. | Legal process served on the City or its vendor | Their policies |
| **Session attendance** | Headcount only, on paper. No sign-in sheet by default. | Nothing to compel | Not kept |
| **Optional follow-up list** (first name + one way to reach you, opt-in only) | The host library, under its own privacy policy. Not NeighborhoodOS. | Legal process served on the library. Records a library holds may also be subject to Missouri's Sunshine Law; library patron records have added protection under state law. Confirm with the library before collecting. | Deleted at the end of each 90-day cohort, or sooner on request |
| **Stipend payments** (name, mailing address, and, above a tax threshold, a tax ID) | The paying partner (library, fiscal sponsor, or grantee) through its normal payroll or vendor system. NeighborhoodOS never sees or keeps it. | Tax authorities; legal process served on the paying partner | The partner's financial-records rules, which are usually several years |
| **Solve clinic problem briefs** | The participant. Briefs are on paper and go home with the person who wrote them. | Nothing to compel from us | Theirs to keep |
| **Public problem log** | Public. Lists places and institutions, never people ("streetlight at 75th and Main, 311 case #…"). | Already public | Until resolved, then archived |
| **Email to the program contact** | The program contact's email provider. | Legal process served on the provider or the contact | Deleted 90 days after the question is resolved |
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

Questions: [simon@simonlpaige.com](mailto:simon@simonlpaige.com).
