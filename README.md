# Swiss IT & AI Events

A curated list of upcoming data, AI, and IT events in Switzerland. Proof of concept — data is currently hand-curated in `src/data/events.json`, scoped to Databricks/Fabric/Power BI/AI governance/data-leadership topics. Built to expand into a broader, automated, Switzerland-wide IT events aggregator if this gets traction.

Project tracking lives in Obsidian: `Cowork_OS\Obsidian_Vault\05_Projects\Event Aggregator\Event Aggregator.md`.

## Stack

Astro (static site), data-driven via an Astro content collection. Deployed free to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`.

## Commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`       | Install dependencies                          |
| `npm run dev`       | Start local dev server at `localhost:4321`    |
| `npm run build`     | Build the production site to `./dist/`        |
| `npm run preview`   | Preview the production build locally          |

## Adding an event

Add an object to `src/data/events.json` (schema enforced in `src/content.config.ts`). Verify against the event's original page before adding — never trust an aggregator's date alone.
