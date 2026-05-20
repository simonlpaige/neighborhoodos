# Civic Memory Safety Doctrine: Banned-Use Guidelines

> **"We design our systems to be bad at surveillance on purpose."**

This document establishes the official Banned-Use guidelines for any NeighborhoodOS node. Under our core safety commitments, these boundaries are programmatic, structural, and non-negotiable. 

If any proposed module, connector, or script violates these guidelines, it is a critical safety violation. The software must refuse to run it, and the community steward must halt its deployment.

---

## The Core Philosophy

Civic memory is a powerful tool for community coordination and municipal accountability. But any database that gathers local public records (such as 311 requests, permits, and violations) and meeting notes can easily be turned into local surveillance. 

We believe that local community trust is the single most important feature we are building. Good software with no trust is a failure. To protect residents, particularly vulnerable and marginalized individuals, our databases are intentionally designed with hard limits.

---

## Prohibited Activities (The Hard Limits)

Every NeighborhoodOS deployment is strictly prohibited from engaging in the following activities:

### 1. No Resident Dossiers and Profiling
We do not build profiles of individual residents. We do not track personal names across datasets, compile histories of individual complaints, or map individual behavior. 
- *Allowed*: Aggregating 311 request types by block or zip code to identify structural issues (such as a chronic landlord violation or water pipeline neglect).
- *Banned*: Selectively querying a resident's history of complaints or building permits to compile a dossier on their personal behavior or civic action.

### 2. No Predictive Policing or Law Enforcement Integration
We do not use crime data or local safety reports to predict individual behavioral outcomes, assign "hot spots," or allocate police resources. Furthermore, no NeighborhoodOS infrastructure or dataset may be integrated with law enforcement, national security, or immigration enforcement systems.
- *Allowed*: Mapping public safety incidents at an aggregated level to guide neighborhood lighting or youth program investments.
- *Banned*: Using machine learning or statistical modeling to predict which residents or blocks are likely to experience "incidents" or sharing any local data feeds with policing agencies.

### 3. No Protest, Speech, or Organizer Monitoring
We do not scrape private or public local social media groups, chat channels, or public forums to index local organizers, map social connections, or track political expression.
- *Allowed*: Documenting public, human-written commitments made by elected officials and city administrators during public meetings to track municipal follow-through.
- *Banned*: Ingesting resident conversations to analyze "sentiment," identify "influencers," or map community disagreements.

### 4. No Resident Scoring or Categorization
We do not assign "trust scores," "risk ratings," "participation metrics," or demographic categories to residents or blocks. Every neighbor is a neighbor, not a data point.
- *Allowed*: Implementing cryptographically blinded trust levels for voting on community surveys (to verify "one vote per resident" without tracking who voted for what).
- *Banned*: Creating an automated score that rates a resident's "value," "civic compliance," or "neighborhood trust."

### 5. No Outbound Automated Civic Decisions
No AI model or automated pipeline may make direct, binding administrative or civic decisions that affect residents. 
- *Allowed*: Using local models to summarize dense, public city budget files or council agendas to help residents write plain-language guides.
- *Banned*: Using an automated script to decide which housing code complaints are escalated, who receives community funds, or who is eligible for local services.

---

## Programmatic Enforcements

Our core database driver (`core/db.js`) programmatically intercepts every SQL query. It blocks the creation of prohibited tables (like `resident_dossiers` or `police_predictions`) or prohibited columns (like `resident_score`), and throws an immediate system error if any direct join attempts to de-anonymize public civic records. 

Safety is not a checkbox or a markdown promise; it is written directly into our code.
