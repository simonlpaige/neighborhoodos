# Budget and Hardware

All figures are **rough planning ranges in US dollars**, written in September 2026. Prices for hardware in particular move quickly. Get real quotes before committing.

## Three sizes

### Size S: Education-only pilot (90 days, no custom software)
| Item | Range |
|---|---|
| Facilitator time (if paid) | $3,000 - $6,000 |
| Community connector and co-facilitator stipends | $1,000 - $2,500 |
| Food for 5-7 sessions | $750 - $1,500 |
| Printing, sticky notes, supplies | $150 - $400 |
| Accessibility (interpretation, large print, captioning) | $0 - $1,500 depending on need |
| **Total** | **roughly $5,000 - $12,000** |

### Size M: Pilot plus one tool and a local AI workstation
Everything in S, plus:
| Item | Range |
|---|---|
| Local AI workstation (see spec below) | $1,500 - $2,500 |
| UPS battery backup, network switch, cables | $200 - $400 |
| 3-5 loaner laptops or tablets | $1,000 - $2,500 |
| Technical volunteer or contractor for one Build | $0 - $6,000 |
| Domain, backups, misc. | $100 - $300/year |
| **Total** | **roughly $8,000 - $24,000** |

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

## Funding angles

Digital inclusion and digital equity funds, library and adult-education grants, community foundation grants, workforce-development money (AI literacy is a job skill), and neighborhood-scale capital grants for the space itself. The education program is the easiest piece to fund first; hardware is easier to fund once a program has proven demand.
