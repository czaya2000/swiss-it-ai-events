// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

// Ended events keep their page (noindex) but leave the sitemap, so Google
// drops them gently instead of hitting a 404.
const today = new Date().toISOString().slice(0, 10);
const endedPaths = new Set(
	[...readJson('./src/data/events.json'), ...readJson('./src/data/archive.json')]
		.filter((e) => (e.endDate ?? e.date) < today)
		.map((e) => `/events/${e.id}/`),
);
const lastScan = readJson('./src/data/meta.json').lastScan;

// https://astro.build/config
export default defineConfig({
	site: 'https://swissdataevents.ch',
	integrations: [
		sitemap({
			// Post-submit confirmation pages are dead ends for search;
			// /social-feed.json and /card/* are machine assets for the n8n
			// social pipeline, not pages anyone should land on.
			filter: (page) =>
				!page.includes('/thanks/') &&
				!page.includes('/card/') &&
				!page.includes('/calendar/') &&
				!page.endsWith('social-feed.json') &&
				!endedPaths.has(new URL(page).pathname),
			// The homepage changes on every refresh; tell crawlers when.
			serialize: (item) =>
				new URL(item.url).pathname === '/' ? { ...item, lastmod: lastScan } : item,
		}),
	],
});
