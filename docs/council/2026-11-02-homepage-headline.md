# Council: homepage headline (2026-11-02)

Target: H1 "Every IT and AI event in Switzerland, checked by hand." on swissdataevents.ch.
Line-up: full (7 critics). The critics apply each thinker's published frameworks; they are not those people.

---

## Chair's report

I checked the claims against the code. The H1 is at `src\lib\events.ts:165`. The title is at `src\pages\index.astro:47` and says "IT & AI events, curated". `SITE_TAGLINE` (events.ts:8) says "hand-verified … data, AI, and IT events". It feeds the meta description and the structured data. Two other pages say "checked by hand": `src\pages\submit\index.astro:9` and `src\pages\impressum\index.astro:35`.

### Verdicts
| Critic | Lens | Verdict | Kill question |
|---|---|---|---|
| Hormozi | Offer | FIXABLE | Why subscribe instead of following vendor and Meetup pages? |
| Godin | Niche | FIXABLE | Can a Zurich Power BI lead see in 3 seconds that this is for them? |
| Thompson | Strategy | FIXABLE | Is "verified" still believed when an event is wrong? |
| Fitzpatrick | Demand | FIXABLE | How did you find your last event? Would you have missed it? |
| Munger | Incentives | FIXABLE | Can you prove 10 random events were verified in the last 7 days? |
| Taleb | Downside | FIXABLE | Can you show the last-verified date for any event? |
| Fried | Simplicity | FIXABLE | Can a visitor tell in 5 seconds this isn't a generic IT directory? |

### Consensus issues
1. **"Every IT" claims too much (7 of 7, High).** The scope is data and AI, not all of IT. "Every" breaks the first time an event is missing. Fix: drop both words and name data and AI.
2. **"Checked by hand" is not quite true (7 of 7, High; Fried rates it Medium).** An AI agent does the checking, and Marcin curates. The true, provable claim is "checked against the organiser's page." Fix: use that phrase. The same claim sits in the tagline, the submit page and the impressum, so update them too.
3. **No audience named and no next step (7 of 7, Medium).** Fix: add a subline with the four topics and the update days. It should not repeat the subscribe block.
4. **Title and tagline repeat "IT" (Thompson, Munger, Fried).** The work confirms this. Fix: change both together with the H1.

### Disagreements
- **What the subline should end on.** Thompson and Taleb want "digest or calendar." Godin and Munger want "by city." Fitzpatrick and Fried want "weekly email." The subscribe block already covers the digest. Settle it by dropping the call to action from the subline.
- **Is the headline the real problem?** Hormozi and Fitzpatrick say demand is unproven: 2 subscribers and 0 pages indexed. No wording fixes that. Settle it with 5 user interviews.

### High-severity single issues
- **Munger and Taleb: the "checked" claim needs proof.** If a last-checked date can't be shown, the claim is weak. The work shows only a site-wide last-scan date (`meta.lastScan`), not a per-event one.

### Recommended H1 and subline
- **H1:** "Data and AI events in Switzerland, each checked against the organiser's page."
- **Subline:** "Databricks, Fabric, Power BI, AI governance and data leadership. Updated Monday, Wednesday and Friday."
- **Title:** "Swiss Data Events — Data & AI events in Switzerland"

### The decision
Should "checked against the organiser's page" become the site's public promise? If yes, it has to be provable on every run. If not, the H1 should claim only scope and freshness.

### Next 3 actions
1. Change the H1 (events.ts:165), the title (index.astro:47) and `SITE_TAGLINE` (events.ts:8) to the copy above. Remove "IT" from all three.
2. Replace "checked by hand" in `src\pages\submit\index.astro:9` and `src\pages\impressum\index.astro:35`.
3. Interview 5 Databricks or Power BI users in one city with Fitzpatrick's question. Ask each one to subscribe or forward the site to a colleague.

---

## Critic reports

### council-hormozi (Offer) — FIXABLE
1. **High: the headline makes a claim the site does not keep.** "Every IT and AI event" vs data/AI-only scope. A DevOps or security professional sees no match; a data professional sees "IT" and wonders if the list is diluted. "Every" invites a disproving search with ~96 events. Fix: name the crowd, drop "Every" and "IT".
2. **High: "checked by hand" is the wrong proof.** An AI agent refreshes three times a week and Marcin curates. "By hand" is vague and slightly misleading. The buyer cares about the result. Fix: state the outcome ("verified against each organiser's page") and freshness ("updated Mon/Wed/Fri").
3. **Medium: no action, and the subscribe block sits right under it.** Alternatives are free (LinkedIn, Meetup, vendor pages). Edge is one place, filtered to the niche. Don't fake scarcity.

Recommended H1: "Data and AI events in Switzerland, in one place and checked against the source." Subline: "Databricks, Fabric, Power BI, AI governance. Updated Mon/Wed/Fri. Get next week's events in your inbox." Shorter alternative: "Swiss data and AI events, verified before you plan." Keep "Switzerland" in the H1 for search. The claim must stay true on every run.

Kill question: Why would a data professional subscribe instead of following Databricks, Microsoft and Meetup pages for free? If only "it's all in one place", the headline can't fix that. The digest must be filtered by city and topic, and the subline should say so.

### council-godin (Niche / marketing) — FIXABLE
1. **High: claims a scope you don't have and a promise you can't keep.** "Every IT and AI event" is everyone, so no one. A cloud-security engineer lands and leaves. Fix: name the niche in the first line.
2. **High: "checked by hand" is false, and the real proof is hidden.** AI agent researches, Marcin curates, each event verified against its own page. Fix: "verified against the organiser's page".
3. **Medium: no reason to subscribe or tell a friend.** It describes a directory. People remark on "the one list my team actually uses". With 2 subscribers, the first job is a tight, belonging-led promise to a small group. Fix: audience identity and the weekly email in the subline.

Recommended H1: "Data and AI events in Switzerland, checked against the organiser's page." Subline: "Databricks, Fabric, Power BI, AI governance. One weekly email, only your city." It names the tribe, keeps a true trust claim, sells the digest, matches the city tags, and uses search words. A niche headline also makes the audience worth paying to reach for featured listings.

Kill question: If a Zurich Power BI lead reads only the headline, can they tell in three seconds that this site is for them, and why to trust it over Meetup or LinkedIn?

### council-thompson (Strategy) — FIXABLE
1. **Scope lie (High).** "Every IT event" is false and the brand is "Swiss Data Events". "Every" lets the first missing event break trust. Promise a niche, not totality.
2. **"Checked by hand" is false and a weak moat (High).** It sells effort. The real value is the outcome: fresh, verified, no dead listings. The moat in a listings aggregator is trust in freshness. Fix: sell "verified against the organiser's page" and the update cadence.
3. **No audience, no action (Medium).** The title tag "IT & AI events, curated" repeats the scope error. Search engines and AI agents use the headline to classify the site. Name Databricks, Fabric, Power BI and AI governance — the demand clusters sponsors will pay to reach.

Strategy note: you own no supply. Organisers, Meetup and Eventbrite can all list events, so the only owned asset is the reader relationship. The headline should lead to the digest and calendar feeds, and frame the site as having the whole niche, so featured listings can be sold later.

Recommended H1: "Data and AI events in Switzerland, verified against the organiser's page." Subline: "Databricks, Fabric, Power BI, AI governance and data leadership. Refreshed Monday, Wednesday and Friday. Get the weekly digest or add the calendar." Also change the title tag (index.astro:47) to "Data & AI events in Switzerland" and update `SITE_TAGLINE`.

Kill question: If an event is missing or wrong on a Monday, does a reader still trust "verified"? Can you keep that promise at 96 events with one person and one agent?

### council-fitzpatrick (Customer evidence) — FIXABLE
1. **High: claims more than the site delivers.** A DevOps or security visitor leaves and distrusts "Every". Fix: name data and AI.
2. **High: "checked by hand" probably false, and not the buyer's problem.** The buyer cares about the outcome (right date, right link). Fix: "each event verified against its own page".
3. **Medium: ignores the evidence.** 2 subscribers, 0 pages indexed, no evidence of how data people find events now or what missing one cost them. Fix: talk to 5 named people in one segment (e.g. Geneva or Zurich Databricks/Power BI users). Ask: "When did you last go to a data event? How did you find it? What did you miss?" Don't pitch. Ask for a commitment: subscribe, or forward it to a colleague.

Recommended H1: "Data and AI events in Switzerland. Each one checked against its source." Subline: "Databricks, Fabric, Power BI, AI governance. Updated Monday, Wednesday and Friday. Get the week's events by email."

Kill question: "Think of the last data or AI event you attended. How did you find it, and would you have missed it without this site?" If the answer is LinkedIn, a colleague or a vendor email, and the site wouldn't change that, there is no demand.

### council-munger (Inversion) — FIXABLE
1. **"Every IT … event" is a promise the site can't keep (High).** An overconfident forecast. Headline and brand disagree; the title tag repeats "IT & AI events". Drop "every" and "IT".
2. **"Checked by hand" is false and risky (High).** A claim to look careful, easy to disprove; if an event is cancelled or wrong, it looks worse. Fix: "checked against the organiser's page" plus a visible freshness date.
3. **No user job or next action (Medium).** No Databricks/Fabric/Power BI/governance; hurts search with 0 pages indexed. Incentives: the visitor wants the one event worth their evening; the owner wants to look comprehensive. The headline serves the owner. Write for the visitor's filter: topic plus place.

Recommended H1: "Data and AI events in Switzerland, each checked against the organiser's page." Subline: "Databricks, Fabric, Power BI, AI governance. Updated Mon, Wed, Fri. Get the weekly digest by city." Change the `<title>` too, so "IT" goes everywhere.

Kill question: Can you prove, for a random sample of 10 listed events, that each was verified against the live organiser page in the last 7 days? If not, any "checked" claim should go.

### council-taleb (Risk) — FIXABLE
1. **"Every … event" has uncapped downside (High).** One missing event proves it false. A trust-first site can't afford that. Promise what you can keep.
2. **"IT" contradicts the real scope (High).** Invites "you missed my DevOps meetup", pulls the wrong visitors, weakens the Google signal on an unindexed site.
3. **"Checked by hand" is half true (Medium).** An AI agent checks, you curate. The edge is real: each event verified against its own page. Say that.

Single point of failure: the headline rests on completeness. A claim about method is hard to disprove; a claim about coverage is easy to disprove.

Recommended H1: "Data and AI events in Switzerland, each checked against the organiser's page." Subline: "Databricks, Fabric, Power BI, AI governance and data leadership. Updated Monday, Wednesday and Friday. Get the weekly digest or add the calendar to your own."

Kill question: Can you show, for any listed event, the date you last verified it against its own page? If not, the claim can't be backed.

### council-fried (Simplicity) — FIXABLE
1. **High: over-promises and misstates scope.** A Databricks person reads "every IT event" and sees a generic list. A DevOps visitor finds nothing and loses trust. Name the real niche.
2. **Medium: "checked by hand" is no longer accurate or useful.** A small lie; the reader cares about the outcome. Fix: "checked against the organiser's page" — true, specific, provable.
3. **Medium: no hint of the action.** Add a short subline; keep the H1 about the listing. Underdo the competition: a small, narrow list that is correct.

Recommended H1: "Data and AI events in Switzerland. Each one checked against the organiser's page." Subline: "Databricks, Fabric, Power BI, AI governance. Updated Mon, Wed, Fri. Get the weekly email." Ship today: one string in events.ts and one `<p>` in index.astro. Check whether `SITE_HEADLINE` is reused in the title or meta tags, and keep the meta description in sync.

Kill question: From Google or social, can a visitor tell in 5 seconds that this list is for them and not a generic IT directory? If not, the traffic won't become subscribers.
