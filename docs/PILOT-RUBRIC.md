# NeighborhoodOS: Pilot Evaluation Rubric

This rubric is a practical tool for community builders, developers, and partners (such as KC Digital Drive) to evaluate whether a proposed neighborhood-benefit tool, dataset, or pilot program is safe to build and deploy.

Before starting any technical design or writing any code, the project team must score the proposal against this rubric.

---

## 🚦 The Red-Light Test (Instant Rejection)

If the proposed pilot triggers **any** of the following criteria, it is rejected immediately. No exceptions.

- [ ] Does it require storing personal resident identity data linked directly to their public municipal records (such as code violations, tenant disputes, or 311 complaints)?
- [ ] Does it integrate with municipal law enforcement, police databases, or immigration enforcement systems?
- [ ] Does it attempt to track or map location patterns of individual residents over time?
- [ ] Does it assign a "risk score," "civic compliance score," or "trust rating" to people or households?
- [ ] Does it ingest public or private social conversations (Reddit, Facebook, WhatsApp, Signal) without explicit, individual, and ongoing opt-in consent?
- [ ] Does it make automated, AI-driven decisions that impact a resident's access to city resources or community benefits?

---

## 📊 Scoring Rubric (Aligning with Community Benefit)

For proposals that pass the Red-Light Test, score them against these three dimensions. Each dimension is scored from 0 to 3. A proposal must score at least **7 out of 9 total points** to be approved for development.

### Dimension 1: Resident Focus & Digital Equity
We build for residents, particularly vulnerable neighbors, not just for city administrators or tech-savvy community leaders.
- **3 Points (High)**: Directly helps vulnerable residents solve a concrete local problem (e.g. tracking a neglectful landlord's violations, navigating local heating assistance, or mapping wheelchair-accessible routes).
- **2 Points (Medium)**: Helps local organizations or neighborhood associations coordinate mutual aid or resource distribution more effectively.
- **1 Point (Low)**: Primarily serves as an administrative or developer dashboard with limited direct resident benefit.
- **0 Points**: Only benefits municipal managers or tech-savvy operators at the expense of resident privacy or equity.

### Dimension 2: Data Provenance & Intellectual Honest
Our databases must be honest. If data is live, we say so; if a feed is parsed or static, we link directly to the original public source.
- **3 Points (High)**: Data is gathered entirely from public-record, verifiable sources (such as City Open Data, county property violations, or public council minutes) with clear, clickable links back to the original source.
- **2 Points (Medium)**: Relies on community-gathered data that undergoes human review and audit before being made visible.
- **1 Point (Low)**: Uses proprietary or scraped data with thin provenance or missing source links.
- **0 Points**: Synthesizes or "guesses" civic facts using unverified AI generation without direct source documentation.

### Dimension 3: Operational Simplicity (The Toothbrush Test)
Does anyone actually use this daily or weekly? Is the technical overhead low enough that a neighborhood can maintain it without a paid engineering team?
- **3 Points (High)**: Fits into an existing weekly workflow (such as a neighborhood meeting agenda or tenant clinic), runs entirely on lightweight local hardware, and requires no ongoing maintenance.
- **2 Points (Medium)**: Requires occasional technical setup or cron job monitoring, but uses standardized SQLite files that can be easily backed up and restored.
- **1 Point (Low)**: Requires complex cloud-hosting setups, high compute costs, or continuous technical support.
- **0 Points**: A massive, fragile platform that will break and rot the moment the lead developer leaves.

---

## 📋 Evaluation Template

```markdown
Project Name: ____________________________________________________
Proposed Partner(s): _____________________________________________
Target Neighborhood Node: ________________________________________

1. Red-Light Test Passed? [Yes / No]
   (If No, list the triggered criteria and halt)

2. Scoring:
   - Dimension 1 (Resident Focus):   ___ / 3
   - Dimension 2 (Data Provenance):  ___ / 3
   - Dimension 3 (Simplicity):       ___ / 3
   -----------------------------------------
   Total Score:                     ___ / 9 (Must be >= 7 to proceed)

Summary and Next Steps:
__________________________________________________________________
__________________________________________________________________
```
