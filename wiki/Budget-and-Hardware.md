# Budget and Hardware

All figures are **rough planning ranges in US dollars**, written in September 2026. Prices for hardware in particular move quickly. Get real quotes before committing.

## Three sizes

### Size S: Education-only pilot (90 days, no custom software)
| Item | Range |
|---|---|
| Facilitator time (if paid) | $3,000 - $6,000 |
| Participant stipends: $30 per 90-minute session, 5 sessions, 12-25 people | $1,800 - $3,750 |
| Peer helper and community connector stipends at $20/hour | $1,000 - $2,500 |
| Food for 5-7 sessions | $750 - $1,500 |
| Printing, sticky notes, supplies | $150 - $400 |
| Accessibility (interpretation, large print, captioning) | $0 - $1,500 depending on need |
| Room | $0 when hosted by the library |
| **Total** | **roughly $7,000 - $16,000** |

*Sizes M and L are not part of the current program. They are here for planning only; see [Later, if residents want it](Later-If-Residents-Want-It.md).*

### Size M: Pilot plus one tool and a local AI workstation
Everything in S, plus:
| Item | Range |
|---|---|
| Local AI workstation (see spec below) | $1,500 - $2,500 |
| UPS battery backup, network switch, cables | $200 - $400 |
| 3-5 loaner laptops or tablets | $1,000 - $2,500 |
| Technical volunteer or contractor for one Build | $0 - $6,000 |
| Domain, backups, misc. | $100 - $300/year |
| **Total** | **roughly $9,500 - $27,500** |

### Size L: Standing community AI hub
Planned as part of a space buildout. See [Community AI Hub Guide](Community-AI-Hub-Guide.md).
| Item | Range |
|---|---|
| Production AI server (multiple GPUs or equivalent) | $6,000 - $25,000+ |
| Dedicated circuit, cooling, secure cabinet | Depends on the building |
| Part-time hub coordinator | Local wage x hours |
| Annual hardware refresh reserve | ~20% of hardware cost per year |

## The prototyping workstation (Size M)

Designed to run small open-weight models entirely on site. Full detail in the [Local Compute Guide](../docs/LOCAL-COMPUTE-GUIDE.md).

- **GPU:** 16 GB of video memory is the practical floor (the original prototype used an NVIDIA RTX 4060 Ti 16GB)
- **CPU:** modern 8+ core
- **RAM:** 32 GB
- **Storage:** 1 TB NVMe SSD
- **Software:** Linux or Windows, [Ollama](https://ollama.com) to host models, the NeighborhoodOS repo for data and tools

**What it can do:** run workshops and demos, summarize public documents, power one small tool for a handful of simultaneous users, and let developers test everything privately.

**What it can't do:** serve a whole neighborhood's traffic at once. That's Size L.

## Why local hardware at all?

Cloud AI tools are cheaper to start and often more capable. Local hardware is worth it when:
- Residents will type things that shouldn't leave the building.
- You want the program to keep working if a vendor changes prices or terms.
- Teaching how AI actually runs is part of the mission.

It is fine to use cloud tools for Learn session demos, as long as participants never enter personal information and the facilitator's account is used.

## Paying participants

Pay attendees and peer helpers at the same rate Kansas City Documenters pays residents to cover public meetings: **$20 an hour**. For a 90-minute session that's $30 per person. Paying people changes who can come: the residents most affected by automated systems are often the ones who can least afford an unpaid evening.

- **Who pays:** the host library, a fiscal sponsor, or the grantee, through its normal system. NeighborhoodOS never collects or keeps payment details. See the [Threat Model](Threat-Model.md).
- **How:** cash-equivalent cards or checks, handed out at the end of each session. No attendance requirement to get paid for the session you came to.
- **Tax:** above a yearly threshold the payer may need a tax form from the recipient. The paying partner handles this; check its rules before the first session and tell participants up front.
- **Peer helpers:** graduates who co-facilitate or staff clinics are paid for prep time as well as time in the room.

## Funding

Library-partnered grants are the best fit, because the library is the host and can be the applicant.

- **IMLS National Leadership Grants for Libraries.** IMLS announced its FY2026 awards on September 2, 2026 and said FY2027 applications would open in September 2026. The CivicAI project the program draws on was funded through this program. Check [imls.gov](https://www.imls.gov/find-funding/funding-opportunities/grant-programs/national-leadership-grants-for-libraries) for current deadlines and eligibility.
- **State library subgrants.** Federal library money is also passed through state library agencies; ask the Missouri State Library what's open.
- **Local funders.** Community foundations, digital inclusion and digital equity funds, and workforce-development money (AI literacy is a job skill).

Stipends are the easiest line to justify and the first to fund. Hardware is easier to fund once residents have asked for it.
