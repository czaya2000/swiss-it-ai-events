# Council: 10 headline propositions (2026-11-02)

Target: replace the H1 "Every IT and AI event in Switzerland, checked by hand." on swissdataevents.ch.
Line-up: Hormozi, Godin, Thompson, Fitzpatrick, Taleb, Fried (Munger excluded at Marcin's request). Follows `2026-11-02-homepage-headline.md`.
The critics apply each thinker's published frameworks; they are not those people.

---

## Chair's report

Ranked top 10. Near-duplicates merged; wording tightened where marked *.

1. **"Data and AI events in Switzerland, verified against the source."** Sub*: "Databricks, Fabric, Power BI, AI governance. Refreshed Monday, Wednesday and Friday."
   - Backers: Hormozi, Fitzpatrick and Taleb (as the H1). Thompson, Fried and Godin use the same proof in their sublines.
   - Why: the scope is honest and both claims can be checked.
   - Risk: it describes how you check, not what the reader gets.
2. **"Find your next data and AI event in Switzerland."** Sub*: "Filter by city and format. Add it to your calendar."
   - Backers: Thompson, Fried, Hormozi.
   - Why: it puts the reader's task first.
   - Risk: it gives no reason to prefer this site over Meetup.
3. **"Find your next Databricks, Fabric, Power BI or AI governance event in Switzerland."**
   - Backers: Fitzpatrick (favourite), Taleb.
   - Why: it uses the reader's own words and lets them self-select fast.
   - Risk: it is long, and it may push away data-leadership readers.
4. **"The Swiss data and AI event calendar."** Sub: "Add it to your calendar, or get the weekly digest."
   - Backers: Thompson (favourite), Taleb.
   - Why: it names the product and points to the two subscribe actions. It also fits featured listings later.
   - Risk: the subline repeats the subscribe block.
5. **"Data and AI events in Switzerland. One list, kept current."**
   - Backers: Fried, Thompson. Godin and Hormozi have "stop searching" variants.
   - Risk: Hormozi warns that "all in one place" is not a reason to come.
6. **"Where Switzerland's data and AI people find their next event."**
   - Backer: Godin (favourite).
   - Why: it is easy to repeat to a colleague.
   - Risk: it claims social proof you can't back yet. You have 2 subscribers, and Fitzpatrick lists "go-to" as a trap.
7. **"The short list of data and AI events in Switzerland."**
   - Backer: Fried (favourite). Godin's "worth your evening" is close.
   - Why: it turns small and curated into the selling point.
   - Risk: 96 events is not a short list.
8. **"What's on in Swiss data and AI."*** ("this month" dropped)
   - Backers: Fitzpatrick, Taleb, Fried.
   - Why: calm and local.
   - Risk: vague, with no proof.
9. **"Never miss a Databricks, Fabric or AI governance event in Switzerland."**
   - Backers: Hormozi, Godin, Thompson.
   - Why: it states the outcome.
   - Risk: "never" is an absolute promise. Fried says it does the subscribe block's job.
10. **"Swiss data and AI events, in your city, in your calendar."**
    - Backer: Hormozi.
    - Why: it sells the calendar feeds.
    - Risk: it lists features and gives no proof.

**Left out:** "Verified, not scraped" (Godin, Taleb), because an AI agent does the research, so the line invites a challenge. "No sponsored listings" (Fried), because it conflicts with the featured-listings plan.

**#1 pick: option 1.** Three critics chose it as the H1, and all six use its proof somewhere. It drops both claims in the current H1 that the work can't support. "Every" overstates a curated, niche list. "By hand" misdescribes an AI agent plus one curator. It keeps the trust claim that featured listings will need later. The tool names go in the subline, not the H1. That keeps the H1 short and still serves the core audience and search.

**Consensus traps (all six critics):**
- Coverage words: "every", "all", "complete", "the only".
- Process claims you can't prove: "by hand", "human-checked", "AI-powered", "curated by experts".
- Vague "IT" (Hormozi, Thompson).
- Hard-coded counts (Taleb, Fitzpatrick, Thompson). If you show "about 96", generate it from the data.

**Disagreements:**
- **Tool names in the H1.** Fitzpatrick and Taleb want them. Thompson and Fried keep them in the subline, because they may put off governance and leadership readers. Settle it with Search Console queries once pages are indexed, or by asking 5 users.
- **Proof vs identity.** Hormozi, Fitzpatrick and Taleb lead with "verified". Godin calls that process bragging and prefers an identity or taste claim. Settle it with Fried's 3-second test: can a cold reader say what is listed, where, and why it beats a Google search?
- **"Never miss" in the H1.** Hormozi, Godin and Thompson back it. Fried says it duplicates the subscribe block. That block already sells the Monday email, so Fried's case is stronger here.
- **"One place".** Thompson and Fried back it. Hormozi says it can't answer "why not Meetup or LinkedIn?"

**Unanswered kill questions:**
- Why come here instead of Meetup or LinkedIn? (Hormozi)
- Can one real person say in one sentence why they'd send this to a colleague? (Godin)
- How do Swiss data pros find events today? Fitzpatrick says ask 5 people before changing the copy.

**The decision:** lead with proof (option 1) or with the reader's task (option 2 or 3). Ship option 1 now, because removing the claims you can't back is urgent. Then test the task-first version against it.

**Next 3 actions:**
1. Replace `SITE_HEADLINE` with option 1, put the subline under it, and deploy.
2. Show option 1 and option 3 to 5 data professionals, and ask what the site lists and why they'd use it.
3. Once Search Console has data, check whether tool-name queries bring traffic, then decide whether the tool names move into the H1.

---

## Critic reports

### council-hormozi (Offer)
Lens: the crowd is a Swiss data/AI professional who loses time hunting across Meetup, LinkedIn and vendor pages. Dream outcome: "I never miss the right event." The current H1 sells a coverage claim and a process — features, not a result. The free alternative is Google or LinkedIn, so the headline must say why this is faster and more trustworthy.

1. **"Data and AI events in Switzerland, checked against the source."** (Favourite) Sub: "About 96 upcoming. Updated Monday, Wednesday and Friday." — Names the crowd; true, provable claim; a real number and rhythm.
2. **"Never miss a Databricks, Fabric or AI governance event in Switzerland."** — The outcome in the buyer's words; tool names filter fast.
3. **"Find your next data and AI event in Switzerland in 30 seconds."** Sub: "Filter by city and format. Add it to your calendar." — Attacks time and effort; test the 30-second claim first.
4. **"Swiss data and AI events, in your city, in your calendar."** — Sells the calendar feeds and city filter as the outcome.
5. **"Skip the search. Swiss data and AI events, verified three times a week."** — Names the free alternative and beats it.

Traps: coverage or purity claims ("every", "all", "complete", "by hand"); brand-first or feature-first lines ("AI-powered event aggregator", "curated listing"), and vague "IT".
Kill question: Why would a busy Databricks or Power BI professional come here instead of Meetup or LinkedIn? If only "it's all in one place", the headline can't fix it. For featured listings later, a verified, targeted audience is the asset you sell.

### council-godin (Niche / marketing)
Lens: the real audience is a small group — data and AI people in Switzerland tired of hunting through Meetup, LinkedIn and vendor pages. Name them and state the change for them; don't promise "every" event.

1. **"The Swiss data and AI events worth your evening."** Sub: "Databricks, Fabric, Power BI, AI governance. Checked against each event's own page, three times a week." — A taste claim, not a coverage claim.
2. **"Where Switzerland's data and AI people find their next event."** (Favourite) Sub: "Zurich to Geneva. Verified against the organiser's page, refreshed Monday, Wednesday and Friday." — "People like us"; easy to repeat to a colleague.
3. **"Stop searching five sites for Swiss data events."** Sub: "One list. Databricks, Fabric, Power BI, AI governance." — Names the tension; points at a pain, not the people.
4. **"Swiss data and AI events. Verified, not scraped."** Sub: "An AI agent checks every listing against its source page. A human curates." — Contrast with sloppy aggregators; risk: makes the visitor think about method.
5. **"Never miss a Swiss Databricks, Fabric or AI governance event."** Sub: "Get the weekly digest, or add the calendar to your phone." — Outcome promise linked to the two actions.

Traps: coverage words; process bragging ("hand-checked", "AI-powered"). If you mention method, use "verified against the organiser's page".
Kill question: With only 2 subscribers, can you show one real person who says in one sentence why they'd send this site to a colleague?

### council-thompson (Strategy)
Lens: a thin aggregator; supply is public pages anyone can copy. The moat is trust, a clear niche and an owned relationship (digest, calendar feeds). The H1 should name the niche, promise a result and make a defensible claim.

1. **"Data and AI events in Switzerland, in one place."** Sub: "Databricks, Fabric, Power BI, AI governance. Checked against each organiser's page, three times a week." — Honest scope, checkable proof, niche words for Google and AI agents.
2. **"Find your next data and AI event in Switzerland."** Sub: "About 96 upcoming events, verified against the source. Updated Mon, Wed, Fri." — The user's job first; the count is proof.
3. **"The Swiss data and AI event calendar."** (Favourite) Sub: "Add it to your calendar, or get the weekly digest." — Names the product and invites the two owned-relationship actions; sets up featured listings (sponsors pay to appear in the calendar).
4. **"Never miss a Swiss data or AI event again."** Sub: "Pick your city and topics. One email a week." — Sells the outcome; may duplicate the subscribe block.
5. **"Databricks, Fabric, Power BI and AI events across Switzerland."** Sub: "Verified against each organiser's page, refreshed three times a week." — Sharp for the core buyer and search; may put off governance and leadership readers.

Traps: coverage claims and "checked by hand" (say "verified against the organiser's page"; don't fake a human touch); generic scope or self-description ("IT events", "event aggregator", "the best platform").

### council-fitzpatrick (Customer evidence)
Lens: state a specific, checkable promise. The brief supports three facts: data/AI scope in Switzerland, each event verified against its own page, refreshed Mon/Wed/Fri. There is no evidence yet that anyone trusts or uses the list, so don't lean on social proof.

1. **"Data and AI events in Switzerland, verified against the source."** Sub: "Refreshed every Monday, Wednesday and Friday." — Segment plus checkable behaviour.
2. **"Find your next Databricks, Fabric, Power BI or AI governance event in Switzerland."** (Favourite) Sub: "~96 upcoming events, checked against each organiser's page." — The segments in the visitor's own words; job first. Use a live count.
3. **"Swiss data and AI events, updated three times a week."** — The cadence is true and measurable.
4. **"What's on for data and AI people in Switzerland this month."** Sub: "Filter by city. Add it to your calendar." — Behaviour-led; points to the calendar feed.
5. **"Every event listed was checked against its own page."** Sub: "Data, AI and analytics events across Switzerland." — Trust via process, not coverage.

Traps: coverage claims; unproven claims ("trusted by", "loved by", "the community's go-to", "by hand", "curated by experts", "AI-powered").
Kill question: Do Swiss data professionals miss events they wanted, and how do they find them today? If LinkedIn or Meetup already works, no headline fixes it. Ask 5 people about the last event they went to before changing the copy.

### council-taleb (Risk)
Lens: "Every … checked by hand" is fragile. One missed event, or one reader who learns an AI agent does the checking, breaks trust. Downside uncapped, upside small. Claim only what you can prove.

1. **"Data and AI events in Switzerland, each verified against its source."** (Favourite) Sub: "Updated Monday, Wednesday and Friday." — Narrow and true; the cadence is a checkable fact. It is also what paid featured listings need.
2. **"Find the next Databricks, Fabric, Power BI or AI governance event in Switzerland."** — A task, not a coverage claim; nothing can disprove it.
3. **"The Swiss data and AI event calendar. Checked three times a week."** Sub: "Add it to your calendar, or get the weekly digest." — Points to feed and digest; the cadence is the evidence.
4. **"Data and AI events in Switzerland, curated, not scraped."** Sub: "Every listing is checked against the organiser's page." — Strong contrast; drop "not scraped" if the agent's research looks like scraping to a sceptic.
5. **"What's on in Swiss data and AI, this month and beyond."** Sub: "~96 upcoming events across Zurich, Geneva, Lausanne, Basel and Bern." — Calm; the count must be generated, not typed.

Traps: absolutes ("every", "all", "complete", "the only"); "by hand" or "human-checked". If you publish a "how we check" page, state the real split. Don't hard-code counts.

### council-fried (Simplicity)
Lens: say what the site is in plain words and claim only what you can prove. A small curated list is a strength — say so.

1. **"Data and AI events in Switzerland. One list, kept current."** Sub: "Databricks, Fabric, Power BI, AI governance. Checked against each event's own page." — Real scope; "kept current" is true.
2. **"The short list of data and AI events in Switzerland."** (Favourite) Sub: "Around 96 upcoming events. Each one checked against its source, three times a week." — "Short list" turns small and curated into the pitch; underdoes the big portals.
3. **"Find your next data or AI event in Switzerland."** Sub: "Filter by city and topic. Add it to your calendar." — Task-first; the subscribe block below sells the digest.
4. **"Data and AI events in Switzerland, without the noise."** Sub: "Curated for data and AI practitioners. No sponsored listings." — Sells less, better; check "no sponsored listings" against the featured-listings plan.
5. **"What's on in Swiss data and AI, this month."** Sub: "Zurich, Geneva, Lausanne, Basel, Bern and online." — Calm and local; "this month" needs a dynamic date.

Traps: unprovable coverage and process claims ("every", "all", "checked by hand"); doing the subscribe block's job ("never miss", "weekly digest" in the H1).
Kill question: If a visitor reads only the H1 for three seconds, can they say what is listed, where, and why this list beats a Google search?

---

## Follow-up: Marcin's own proposal (Hormozi lens)

Proposal: H1 "Discover AI & Data Events Across Switzerland". Sub: "Find conferences, meetups and workshops in one place. Curated, verified and updated regularly."

**Verdict: FIXABLE.**
- Works: right scope ("AI & Data", no "every IT"), "Across Switzerland" is clear, event types named in plain words, "by hand" gone.
- High: no proof, no number. "Curated, verified and updated regularly" is three vague claims everyone makes; use the real facts (checked against source, Mon/Wed/Fri).
- Medium: "Discover" sells browsing, not a result; "in one place" is what Meetup and LinkedIn claim too.
- Low: no pull to act, but the subscribe block covers that.

Tightened version (keeps the owner's structure): H1 "Discover AI & Data Events Across Switzerland". Sub: "Conferences, meetups and workshops in one place. Each one checked against its source, updated Monday, Wednesday and Friday." ("Find" is slightly more direct than "Discover".)

Versus the earlier favourite: not better as written. With the tightened subline the two are close — the owner's is friendlier and names event types; "checked against the source" in the H1 puts trust higher. If the owner prefers the voice, ship the tightened version; it loses little.
