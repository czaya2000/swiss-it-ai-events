## Project

Public POC website listing IT & AI events in Switzerland. Data lives in
`src/data/events.json` (schema in `src/content.config.ts`) — hand-curated for now,
Switzerland-only, scoped to Databricks/Fabric/Power BI/AI governance/data-leadership
topics. Never mix in Marcin's personal job-search scoring/fields (score, OCE notes,
exam clashes) from `Cowork_OS\00_Resources\Event_Scan_Rubric.md` — that pipeline
feeds his private Job Search HQ workbook and is a separate, unrelated system.

`astro.config.mjs` sets `site: 'https://swissdataevents.ch'` and no `base` — update it
if the repo is renamed or the custom domain changes.

## Daily refresh (`.github/workflows/daily-refresh.yml`)

One scheduled GitHub Actions job does everything: researches new/changed events,
updates `src/data/events.json` and `src/data/meta.json`, validates, pushes to `main`,
builds, and publishes `dist/` to Pages via a separate `deploy` job (`actions/deploy-pages`). It runs **every day** at
05:00 UTC (07:00 Zurich in summer, 06:00 in winter — GitHub cron has no DST) and can be
run on demand via **workflow_dispatch**. Nothing about it depends on a personal machine.

- Daily since 2026-11-02 (Mon/Wed/Fri before). The homepage subline says "checked
  daily" (`SITE_SUBHEADLINE` in `src/lib/events.ts`), so if the cron goes back to fewer
  days, change that wording too.
- The 05:00 cron was meant to land before the n8n social workflow's 08:00 run, but in
  practice GitHub starts scheduled runs 4–8 hours late (09:30–13:30 UTC). Accepted as is
  (2026-11-10): n8n was an experiment and is not running. If it comes back, start the
  refresh from outside (e.g. a Cloudflare Worker cron calling workflow_dispatch).
- Cost: each pass is roughly $4.60–5.60 equivalent on Opus 5 (30 Oct run: $5.64, 142
  turns), charged to the Claude subscription, so daily is ~$35–40/week equivalent. If
  it needs trimming, cut `SOURCES.md`; most turns are per-source checks.
- **Use Opus 5.** Sonnet 5 managed one proper pass in three attempts; the others gave up
  after ~1 minute and 10 turns having checked almost nothing and declared no changes.

- Research, build and deploy are deliberately **one workflow run** (the `deploy` job
  just waits on `refresh` via `needs`). GitHub does not trigger workflows from commits
  made with the default `GITHUB_TOKEN`, so a separate deploy workflow would never fire.
- Pages publishes from **GitHub Actions** (Settings → Pages → Source), since 2026-11-10:
  the branch-based publish hung at "syncing_files" three runs in a row. The `deploy` job
  needs the `github-pages` environment, which allows `main` and `gh-pages`. The job still
  force-pushes `dist/` to `gh-pages` as a rollback: switch the source back to that branch.
  Manual runs take a `deploy_only` input to rebuild and publish without researching.
  `public/CNAME` is copied into `dist/` by the build (used by the `gh-pages` rollback).
- Node is pinned to **22** (`engines: >=22.12.0`). The previous workflow was deleted in
  `e8109ba` because it defaulted to Node 20 and failed on every push.
- `scripts/validate-events.mjs` (`npm run validate`) gates the push — it catches what
  the Astro schema can't, notably malformed dates, which otherwise break sorting
  silently on the live site.
- `scripts/scrape-meetup.mjs` (`npm run scrape:meetup`) renders meetup.com listing
  pages with Playwright, because they are client-rendered and return nothing to a
  plain fetch. It handles both named groups and `/find/` keyword searches.
- The push step rebases and retries: n8n writes card PNGs to `main` on its own
  cadence, so a plain push loses the race often enough to matter.
- Calendar subscription feeds (`/calendar/*.ics`, one per city × format
  combination) are generated inside `astro build` by
  `src/pages/calendar/[feed].ics.ts`, so every refresh updates them with no
  workflow change. UIDs are `<event id>@swissdataevents.ch` — never change the
  event id or the UID format, or subscribers get duplicates. Check with
  `npm run test:ics` after a build (needs Node ≥ 22.18; not run in CI).
- Ended events are **archived, not deleted**: the workflow's `npm run archive` step
  (`scripts/archive-past.mjs`) moves events that ended more than 3 days ago to
  `src/data/archive.json`. Their pages stay up with an "ended" banner and a title
  that starts with "Past event:". Since 2026-11-12 they stay in Google (no `noindex`),
  but are left out of the sitemap, homepage, hub pages, feeds and llms.txt. The refresh agent
  must not delete past events or edit the archive.
- Public data for apps and AI agents: `/events.json` (documented at `/data/`; never
  rename or remove a field without bumping `DATA_VERSION` in `src/lib/public-data.ts`),
  `/rss.xml`, `/llms.txt`. All built from upcoming events only. `robots.txt` welcomes
  AI crawlers explicitly.
- Analytics: Umami Cloud (EU, cookieless) plus Cloudflare Web Analytics, both in
  `src/layouts/Base.astro`. Card pages don't use Base, so the n8n screenshots aren't
  counted; keep it that way. Click events use `data-umami-event` attributes. Opening a
  page with `?notrack` excludes that browser (`?track` undoes it). If a tracker is
  added or removed, update `/privacy/`.
- The inline script in `Base.astro` removes any email address from the page address
  before the trackers load (Buttondown adds `?email_address=` to `/subscribe/thanks/`).
  Keep it above both tracker scripts. What each Umami event really counts is in the
  table in `SEO_GEO_RUN.md` ("Digest signup" is a button click, not a subscriber).
- Event markup states only what the data says: `offerFacts()` in `src/lib/events.ts`
  gives a price for "Free" or one plain amount and "SoldOut" only when the cost says
  so; `isFree()` is true only when the cost starts with "Free". No assumed end time.
- `SEO_GEO_RUN.md` (12 Nov 2026) has the SEO/AI-search baseline, the follow-up
  measurements and what was left alone on purpose.
- Sources live in `SOURCES.md` and are re-read on every run — edit that file to change
  what gets checked; the workflow prompt does not hardcode a source list.

Running project log (status, decisions, next steps): `Cowork_OS\Obsidian_Vault\05_Projects\Event Aggregator\Event Aggregator.md`. Keep it updated as work happens.

Astro pinned to `^6.4.8` — Astro 7.3.0 fails to build on this machine (Vite/rolldown
`_internal/logger` export error). Don't upgrade past 6.x without confirming the
build actually works first.

## City and type pages ("hubs")

- `/zurich/`, `/geneva/`, … (the newsletter's nine cities) and `/meetups/`,
  `/conferences/`, `/workshops/`, `/networking/`, `/webinars/`. Defined in
  `src/lib/hubs.mjs`, built by `src/pages/[hub]/index.astro`.
- They and the homepage render the same `src/components/Listing.astro` (filters,
  rows, script, styles). Change the listing there, not in `index.astro`.
- A hub with fewer than `HUB_MIN_EVENTS` (5) upcoming events still has a page, but
  it is `noindex`, left out of the sitemap (`astro.config.mjs`) and not linked from
  anywhere. It comes back on its own when the count recovers.
- Never rename a hub slug once it is live: Google will have indexed the URL.
- A hub pre-ticks its own tag in the digest dialog and its own feed in "Save to my
  calendar". Signups from hubs carry `placement: hub` in Buttondown.
- No topic pages: `topics` is free text with 100+ values, most with 1–5 events.

## Weekly digest (Buttondown, newsletter `swissdataevents`)

- `src/components/Subscribe.astro` posts straight to Buttondown's embed endpoint
  (no backend). Each ticked box sends a `tag`: `city-<slug>` / `format-<slug>`.
  Buttondown does the double opt-in, unsubscribes and bounces.
- `src/lib/newsletter.mjs` holds the fixed city list (Zurich, Geneva, Lausanne,
  Basel, Bern, Lucerne, Lugano, Neuchâtel, Online) and maps every smaller place to
  the nearest one. Never rename a tag: subscribers already hold it. There is no
  "Other" city by design. `npm run validate` warns about unmapped places; add them
  to `PLACE_TO_CITY`. The homepage City filter, calendar feeds and "Upcoming in …"
  use the same nine cities (`cityGroup()` in `src/lib/events.ts` reads this list);
  only "Online (CH)" keeps its own label so its feed stays `online-ch.ics`.
- Matching: city AND format; no city chosen = all cities, no format = all formats.
  "Nationwide" and unmapped places go to everyone.
- `scripts/build-digest.mjs` (`npm run digest -- --dry-run`) builds ONE email for
  everyone with two sections: **Next two weeks** (events on in the next 14 days,
  new ones marked with the red dot) and **New this week** (first seen in the last
  7 days, happening later). No event appears twice. Each event is wrapped in Django
  `{% if %}` checks on `subscriber.tags`, and the email is saved as a Buttondown
  **draft** with the archive disabled and the `classic` template. It refuses to
  create a second email with the same week subject (`--replace` overwrites a
  draft). The workflow runs it on Mondays after the deploy, with the
  `BUTTONDOWN_API_KEY` secret (skips if the secret is missing).
- Size: Gmail clips emails over ~102 KB, and a reader with no filters gets every
  row. "New this week" is always one-line rows; the top section uses the fullest
  layout (blurbs → no blurbs → one-line) that keeps that reader under 90 KB, and
  the dry run prints which one and the size. `--from=YYYY-MM-DD` skips events
  already over when a draft goes out late. Keep row markup lean.
- The email is raw HTML with inline styles copied from `src/styles/theme.css`;
  keep the `buttondown-editor-mode: plaintext` marker, or Buttondown's visual
  editor strips the styling. Buttondown's email accent colour must stay black:
  it is forced onto every link.
- `buttondown/web.css` is the Custom CSS for Buttondown's web pages (Settings →
  Web): site fonts and colours, and the Cities / Event types columns on the
  Manage subscription page. Those columns place each tag by its Buttondown id, so
  a new tag needs a line there. Paste the whole file back after editing.

## Social pipeline (do not break these two contracts)

**Status (2026-11-10): n8n is paused; it was an experiment and is not running.** Keep the
contracts below intact anyway so it can be switched back on.

`src/pages/social-feed.json.ts` -> `/social-feed.json` and
`src/pages/card/[format]/[slug].astro` -> `/card/{wide,square,story}/<slug>/`
exist for the n8n workflow in `Cowork_OS\\Apps\\n8n` (runbook:
`Apps\\n8n\\SOCIAL_MACHINE.md`). n8n polls the feed, screenshots the card
pages with headless Chromium, and posts to X / LinkedIn / Instagram / TikTok.

- `postKey` in the feed is the dedupe key (`id::date::city`). Changing how it
  is built re-announces every event once.
- `listingUrls.{x,linkedin}` are the UTM-tagged links n8n puts in posts (for
  Umami attribution); the n8n prompt falls back to `listingUrl` if they are
  missing. Don't rename either field.
- Card pages are a fixed pixel canvas per format. Test a design change at
  `/card/wide/<slug>/` before deploying - what you see is what gets posted.
- Both are `noindex` and excluded from the sitemap; keep them that way.
- Generated PNGs are committed by n8n to `public/social/`. Leave them alone;
  `git pull` before editing `events.json` so the refresh task does not diverge.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
