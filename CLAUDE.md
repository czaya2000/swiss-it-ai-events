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
builds, and force-pushes `dist/` to the `gh-pages` branch. It runs at 11:00 UTC
(13:00 Zurich in summer, 12:00 in winter — GitHub cron has no DST) and can be run on
demand via **workflow_dispatch**. Nothing about it depends on a personal machine.

- Research, build and deploy are deliberately **one job**. GitHub does not trigger
  workflows from commits made with the default `GITHUB_TOKEN`, so a split
  refresh-then-deploy pair would never fire the second half.
- Pages serves from the **`gh-pages` branch** (legacy branch source), not from Actions.
  `public/CNAME` and `public/.nojekyll` are copied into `dist/` by the build.
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
- Sources live in `SOURCES.md` and are re-read on every run — edit that file to change
  what gets checked; the workflow prompt does not hardcode a source list.

Running project log (status, decisions, next steps): `Cowork_OS\Obsidian_Vault\05_Projects\Event Aggregator\Event Aggregator.md`. Keep it updated as work happens.

Astro pinned to `^6.4.8` — Astro 7.3.0 fails to build on this machine (Vite/rolldown
`_internal/logger` export error). Don't upgrade past 6.x without confirming the
build actually works first.

## Social pipeline (do not break these two contracts)

`src/pages/social-feed.json.ts` -> `/social-feed.json` and
`src/pages/card/[format]/[slug].astro` -> `/card/{wide,square,story}/<slug>/`
exist for the n8n workflow in `Cowork_OS\\Apps\\n8n` (runbook:
`Apps\\n8n\\SOCIAL_MACHINE.md`). n8n polls the feed, screenshots the card
pages with headless Chromium, and posts to X / LinkedIn / Instagram / TikTok.

- `postKey` in the feed is the dedupe key (`id::date::city`). Changing how it
  is built re-announces every event once.
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
