# Facilitator manual: Build only what helps

Build after a clinic reveals a repeated task that a small tool can improve. A clearer form, a printable checklist, or a better referral may be enough. This manual describes a decision process, not an operating local AI service.

## Start with the problem

Write down who will use the tool, the task they need to finish, and how they manage it now. Ask a resident and facilitator to try a paper version before writing code. Agree who will maintain it and how it can be retired.

## Minimum useful behavior

- Make the next action clear in plain language.
- Show original sources, their dates, and uncertainty.
- Keep resident input local where possible; collect only what is necessary and explicitly agreed.
- Require a person's review before sending a message or filing anything.
- Support keyboard use, text enlargement, a narrow screen, both themes, and paper where useful.
- Follow the active [design guide](../DESIGN.md) and [safety doctrine](../wiki/Safety-Doctrine.md).

## Review the whole system

Local hosting alone does not guarantee privacy. Review network requests, storage, logs, dependencies, access, and backups. Code guards and prompts are partial controls; they do not replace a human review of the data and use case. Do not combine identity information with public complaint records.

The deployed NeighborhoodOS site uses static pages and dated public snapshots. Experimental Node/SQLite modules in this repository are separate and are not required to build or use the website.

## Decide whether it worked

Watch someone complete the intended task without coaching. Record where they get stuck, whether the source supports the result, and whether the next action helps. Fix those problems before adding features. Use the [evaluation plan](../wiki/Evaluation-and-Metrics.md) and [public-data manual](Civic-Data-Ingest-Guide.md).
