# Later, if residents want it

NeighborhoodOS today is two things: free, practical AI help for Waldo neighbors, and clinics for stuck civic problems. Everything on this page is **not** part of the current program. It is written down so the ideas aren't lost, and so nobody mistakes them for promises.

## What's here

### Neighborhood memory beyond links
A local database of public records (311, permits, violations, budgets, council votes) plus a tracker for promises officials make in public. Today the program simply links to the City's own sources and to [Kansas City Documenters](Partners.md) for meetings. The code for a fuller data layer exists (`connectors/`, `ingest/`) and is described in [Technical Architecture](Technical-Architecture.md) and [Data Sources](Data-Sources.md).

### Community governance tools
Resident identity, trust levels, five voting methods, paper ballots, issues, and federation between neighborhoods (`identity/`). It runs and is tested, but has no resident-facing app. See [Known Gaps and Roadmap](Known-Gaps-and-Roadmap.md).

### Local AI infrastructure
A community AI hub: a trusted room, loaner devices, and modest hardware that runs AI models on site, so neighbors' questions don't leave the building. See [Community AI Hub Guide](Community-AI-Hub-Guide.md) and the Size M and L budgets in [Budget and Hardware](Budget-and-Hardware.md).

## When any of this should start

Only when all of these are true:

1. **Residents asked for it.** It came up in Solve clinics, and the advisory residents agree it's worth doing. Not because a funder, partner, or developer wants it.
2. **The simple version failed.** A spreadsheet, a printed list, or an existing city tool was tried first and wasn't enough.
3. **It passes the [Pilot Rubric](../docs/PILOT-RUBRIC.md)**, 7/9 or better and the Red-Light Test.
4. **The [Threat Model](Threat-Model.md) is updated first**, with a row for every new kind of data, and the data steward signs off.
5. **Someone will run it.** A named person has the hours to maintain it for at least a year.

## Why it's on a separate page

Earlier descriptions of NeighborhoodOS led with infrastructure and governance. That made the project sound like a platform that residents would have to trust before getting anything useful. The program works the other way around: help first, trust earned, tools only if people ask for them.
