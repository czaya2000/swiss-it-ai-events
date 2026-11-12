# SEO / GEO run — 12 November 2026

Audit, fixes and release notes for swissdataevents.ch. Not a public page (the build
only publishes `public/` and `src/pages/`).

## Baseline

- Start commit: `9eab58a` (main). Production before the run: the `deploy_only` build
  of 11 Nov 15:12 UTC (run 43045984186), "Last scanned 11 Nov 2026, 16:12".
- Deploy: a push to `main` does not publish. The `Daily refresh` workflow (scheduled,
  or run by hand, with or without `deploy_only`) builds and publishes.
- Rollback: `git revert 3165f44`, push, then run the workflow with `deploy_only`.
  The `gh-pages` branch also holds the previous build until the next run.
- Baseline checks: build OK (839 pages), `npm run validate` OK (157 events),
  `npm run test:ics` OK. No pre-existing failures.
- Live checks: http, www and the github.io address all 301 to
  `https://swissdataevents.ch/`; missing trailing slash 301s; query strings are kept.

## Evidence

### Search Console (domain property)

Data exists only from 23 Oct 2026 (the property was added on 24 Oct), so the "28 days"
view is 23 Oct – 10 Nov and there is no earlier period to compare with.

- 208 clicks, 4,820 impressions, CTR 4.3%, average position 6.8.
- Devices: desktop 152 clicks / 3,225 impressions, mobile 54 / 1,587.
- Countries: Switzerland 165 clicks / 3,406 impressions; Germany 305 and US 201
  impressions with few clicks.
- Queries: 140 listed, almost all are event names ("snowflake forum zurich" 336
  impressions, "swiss ai safety days" 180). Only about 12 of the 208 clicks have a
  visible query; Google hides the rest. Generic searches are rare and rank far down:
  "ai events zürich" position 71, "it events" 56, "digitalisierung event schweiz" 65.
- Pages: event pages get nearly everything. Homepage 11 clicks / 214 impressions.
  Low click rate on big-name events where the organiser ranks first:
  Snowflake Forum 1,026 impressions / 6 clicks, Swiss AI Safety Days 500 / 3.
- Indexing: 205 indexed, 27 not. The 27 are calendar feeds and `rss.xml` (expected),
  six `noindex` pages (intended) and one removed feed (404). No canonical problems.
- Sitemap: read 11 Nov, Success, 149 pages.
- Events report: 74 valid, 0 invalid. Warnings are optional fields only.
  Breadcrumbs: 86 valid.
- "Generative AI features" report (Google's own AI answers only, impressions only):
  116 impressions on 46 pages, nearly all since 8 Nov. It says nothing about Claude,
  ChatGPT or Perplexity.

### Umami (26 Oct – 12 Nov, own visits excluded where `?notrack` was used)

- 598 visits, 537 visitors, 1,055 views. Views are inflated: every filter change and
  every typed search letter rewrites the address and counts as a view. Use visits.
- Channels: direct 293, organic search 237, referral 6, social 5, email 4, "llm" 1.
- Referrers: google.com 215, bing 8, duckduckgo 7, gemini.google.com 1. No claude.ai,
  no chatgpt.com, no perplexity.ai referrer.
- UTM: `utm_source=chatgpt.com` 82 visits (42 landed on the homepage; 61 from
  Switzerland). `newsletter` 2. Nothing for Claude.
- Events: Register click 156, Digest signup 17, Digest: open 14, Event submitted 8,
  Calendar: open 7, Calendar: subscribe 0, Contact sent 0.
- Views of `/subscribe/thanks/` 10 and `/subscribe/confirmed/` 9.
- **Problem found:** Buttondown adds `?email_address=…` to the address of
  `/subscribe/thanks/`, so 11 page views were stored with a subscriber's email address.

What each number measures:

| Name | What it counts |
|---|---|
| Register click | A click on the organiser button on an event page. Not a registration. |
| Calendar: open | The "Save to my calendar" dialog was opened. |
| Calendar: subscribe | A click on a calendar app button or "Copy link". |
| Digest: open | A click on "Get weekly digest" (also fires with an empty or invalid email). |
| Digest signup | A click on "Subscribe" in the dialog. Not yet a subscriber. |
| View of `/subscribe/thanks/` | The form reached Buttondown and came back: a submission. |
| View of `/subscribe/confirmed/` | The person clicked the confirmation email: a subscriber. |
| Event submitted / Contact sent | A click on the send button, even if the form was incomplete. |

All 8 "Event submitted" clicks came from visits tagged `utm_source=chatgpt.com`.
Compare with the submissions that actually arrived by email.

### Claude traffic: four separate answers

1. **Can Claude's systems reach the site?** Nothing blocks them. `robots.txt` allows
   `ClaudeBot`, `Claude-SearchBot` and `Claude-User` by name; the site is static on
   GitHub Pages with no firewall or bot challenge. Whether they have actually visited
   cannot be checked: GitHub Pages gives no server logs. (A test with a copied
   user-agent would prove nothing about the real crawler.)
2. **Does Claude cite the site?** Not observed. Ten neutral searches on 12 Nov 2026
   through the web search tool in this Claude Code session (US-based, standard mode)
   returned no swissdataevents.ch result:
   EN "AI events Zurich November 2026", "upcoming data and AI meetups in Switzerland",
   "AI conferences Switzerland 2026 2027 list", "AI events Geneva this month",
   "Databricks Microsoft Fabric events Zurich upcoming", "AI workshops Lausanne Bern
   Basel upcoming events"; DE "KI Events Zürich November 2026", "KI Veranstaltungen
   Schweiz kommende Konferenzen Meetups"; FR "événements intelligence artificielle
   Genève novembre 2026", "conférences et meetups IA data Suisse romande à venir".
   Results went to myswitzerland.com, eventbrite, luma, meetup, dev.events,
   allai.events, beri.net and organisers' own pages. A diagnostic search with the
   domain name in it also returned nothing from the site. This is one tool, one day,
   ten queries: not a measure of claude.ai, and not representative.
3. **Do people click through from Claude?** No visit carries a claude.ai referrer or a
   Claude tag. That is weak evidence of few or no clicks, not proof.
4. **Would analytics show it?** Yes for the browser case: in a local test with the
   real Umami script, a visit with referrer `https://claude.ai/` and a UTM tag was
   recorded with both. But Claude does not add a UTM tag to its links (ChatGPT does,
   which is why ChatGPT shows up), and clicks from the Claude desktop and mobile apps
   are reported to arrive with no referrer, so they would sit in "direct". The 293
   direct visits cannot be split further. So "no Claude UTM traffic" was always going
   to be true; the referrer is the thing to watch.

Most likely reading: the site is reachable, but for generic "AI events in Zurich"
questions the search index Claude uses does not rank a three-week-old domain, the same
way Google ranks it around position 70 for those words.

## Backlog and what was done

| # | Finding | Fix | Status |
|---|---|---|---|
| 1 | Subscriber emails stored in Umami (and sent to Cloudflare) via the thank-you address | `Base.astro` removes any email parameter before the trackers load | Done, `3165f44` |
| 2 | Event markup said "InStock" for every event, including two sold-out ones | Availability only when the cost says "sold out" | Done |
| 3 | `isFree()` matched any "free": 4 paid or mixed events marked free (markup price 0, `free: true` in `/events.json`) | Free only when the cost starts with "Free" | Done |
| 4 | Events with one plain price had no price in markup | Price for "CHF 450"-type costs; none for tiers, "from", "not listed" | Done |
| 5 | Markup gave an end time that was assumed (start + 2 h) | End only when published | Done |
| 6 | `addressLocality` was "Thônex (Geneva)" | Now "Thônex" | Done |
| 7 | 107 of 147 titles over 70 characters | Compact date; site name only when it fits. 52 remain (long event names) | Done |
| 8 | Descriptions were the blurb only | Date, time, place, type, cost first | Done |
| 9 | One live event missing from the sitemap (id also in the archive) | Live entry wins | Done |
| 10 | Three thank-you pages were indexable | `noindex` | Done |
| 11 | Unknown addresses showed GitHub's error page | `src/pages/404.astro` | Done |
| 12 | Privacy and Impressum had no link from any page | Two small links in the footer line | Done |
| 13 | `llms.txt` did not list city/type pages and told assistants what to link | Lists live hubs; plain description instead | Done |
| 14 | A `deploy_only` run resets "Last scanned" | One `if:` on the stamp step | **Staged**, branch `proposal/stamp-scan-time-only-after-research` (`5fd8aa0`), needs approval |

Files: `src/layouts/Base.astro`, `src/lib/events.ts`, `src/pages/events/[slug].astro`,
`src/pages/llms.txt.ts`, `src/pages/404.astro`, `src/components/SiteFooter.astro`,
`astro.config.mjs`, three `thanks/index.astro`, `scripts/build-digest.mjs`.
Routes: every `/events/<id>/` page (head and markup only; nothing visible changed),
`/llms.txt`, `/events.json` (4 corrected `free` values, no field change, `DATA_VERSION`
stays 1), `/social-feed.json` (same 4 values; `postKey` and `listingUrls` identical),
`/404.html` (new), footer on all pages. Calendar feeds are byte-identical apart from
the timestamp. No URL, id, canonical or redirect changed.

## Checks

Automated, same event data before and after:

- Build, `npm run validate`, `npm run test:ics`: pass.
- Static audit of all 840 built pages: no broken internal links; 144 indexable pages =
  144 sitemap URLs (was 147 vs 143); no orphan pages; canonicals correct; one `h1` per
  page; all JSON-LD parses; card pages still `noindex`; 216 ended pages still `noindex`
  with no Event markup; sitemap diff = +1 URL (the missing event), nothing removed.
- Browser test (Chromium, 1280 px and 390 px, production hostname mapped to the local
  build, analytics and Buttondown requests intercepted so nothing was sent): 52 of 52.
  Covers filters, search, calendar dialog, digest dialog and form post, register link,
  hub page, event page, 404, no horizontal scroll, no script errors, each Umami event
  firing once, and no email address in any analytics request.
- RSS well-formed, 128 items; `/events.json` same keys and count.

Inspected by hand: 404 page and event page at desktop and mobile width; offer markup
for every distinct cost text; titles and descriptions of sample pages.

Not done: Google Rich Results Test and URL Inspection on the new build (only possible
after it is live); Lighthouse; a real screen reader.

## Deployment

- `3165f44` pushed to `main` on 12 Nov 09:45 UTC, before the day's scheduled run
  started, so that run publishes it with a genuine scan time. See the project log for
  the production check.

## Not changed, on purpose

- (Changed later the same day, with Marcin's approval, `59987e2`: ended event pages
  no longer carry `noindex`. Their title starts with "Past event:" and their
  description with "This event took place on …". They stay out of the sitemap,
  listings and feeds. The workflow fix, row 14 above, was also approved and pushed
  as `da429c2`. To undo the ended-event change alone: `git revert 59987e2`.)
- No German or French pages, no topic pages, no new hubs: no evidence of demand yet,
  and hubs are one day old.
- Event `image` is the same site banner for every event. Google's event feature is not
  offered in Switzerland anyway, so per-event images would mostly help link previews.
- Search letters and filter changes still count as page views in Umami.
- The 11 stored page views with an email address are still in Umami. Umami has no
  per-row delete; ask Umami support or reset the website data if this matters.

## Follow-up measurements

Compare like with like: same weekday span, visits not views, and note how many
upcoming events were listed (128 on 12 Nov), because impressions follow the inventory
and big-name events.

**2–4 weeks (26 Nov – 10 Dec), against 23 Oct – 10 Nov**
- Search Console: indexed count; are the ten hub pages indexed, and for which queries;
  click rate on event pages at positions 3–8 (was mostly 1–8% on big names).
- Events report: "availability" and "price" warnings will rise (expected: those
  fields are now left out when unknown). Invalid must stay 0.
- Umami: referrers containing `claude.ai`, `chatgpt.com`, `perplexity.ai`,
  `gemini.google.com`, `copilot.microsoft.com`; `utm_source=chatgpt.com` visits per
  week (82 in 17 days); no new address containing `email`.
- Repeat the ten neutral searches above, same wording, and note any citation.

**6–8 weeks (24 Dec – 7 Jan; expect a holiday dip, so also compare with early Dec)**
- Search Console over 3 months: non-brand, non-event-name queries (cities, "ai events",
  "meetup") and the hub pages' impressions.
- Umami per week: Register clicks per visit (156 / 598 = 26%), views of
  `/subscribe/confirmed/` (9), Calendar: subscribe (0).
- Generative AI report in Search Console: impressions trend (116).

With volumes this small, treat any change under about ±30% as noise.
