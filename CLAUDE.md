## Project

Public POC website listing IT & AI events in Switzerland. Data lives in
`src/data/events.json` (schema in `src/content.config.ts`) — hand-curated for now,
Switzerland-only, scoped to Databricks/Fabric/Power BI/AI governance/data-leadership
topics. Never mix in Marcin's personal job-search scoring/fields (score, OCE notes,
exam clashes) from `Cowork_OS\00_Resources\Event_Scan_Rubric.md` — that pipeline
feeds his private Job Search HQ workbook and is a separate, unrelated system.

Deploys to GitHub Pages automatically on push to `main` (see
`.github/workflows/deploy.yml`). `astro.config.mjs` sets `base`/`site` for the
`czaya2000.github.io/swiss-it-ai-events` path — update both if the repo is renamed
or a custom domain is added.

Running project log (status, decisions, next steps): `Cowork_OS\Obsidian_Vault\05_Projects\Event Aggregator\Event Aggregator.md`. Keep it updated as work happens.

Astro pinned to `^6.4.8` — Astro 7.3.0 fails to build on this machine (Vite/rolldown
`_internal/logger` export error). Don't upgrade past 6.x without confirming the
build actually works first.

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
