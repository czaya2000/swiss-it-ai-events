// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { HUBS, isHubLive } from './src/lib/hubs.mjs';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

// Ended events keep their page (noindex) but leave the sitemap, so Google
// drops them gently instead of hitting a 404.
const today = new Date().toISOString().slice(0, 10);
// A live event wins over an archived one with the same id (a recurring event
// that reuses its id), exactly as getAllEvents() does for the page itself.
const liveEvents = readJson('./src/data/events.json');
const liveIds = new Set(liveEvents.map((e) => e.id));
const endedPaths = new Set(
	[...liveEvents, ...readJson('./src/data/archive.json').filter((e) => !liveIds.has(e.id))]
		.filter((e) => (e.endDate ?? e.date) < today)
		.map((e) => `/events/${e.id}/`),
);
const lastScan = readJson('./src/data/meta.json').lastScan;

// City and type pages (/geneva/, /conferences/): those with too few upcoming
// events are noindex, so they stay out of the sitemap as well.
const upcoming = readJson('./src/data/events.json').filter((e) => (e.endDate ?? e.date) >= today);
const hubPaths = new Set(HUBS.map((h) => h.path));
const thinHubPaths = new Set(HUBS.filter((h) => !isHubLive(h, upcoming)).map((h) => h.path));

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
				!page.includes('/subscribe/confirmed/') &&
				!page.includes('/card/') &&
				!page.includes('/calendar/') &&
				!page.endsWith('social-feed.json') &&
				!endedPaths.has(new URL(page).pathname) &&
				!thinHubPaths.has(new URL(page).pathname),
			// The homepage and the city/type pages change on every refresh; tell crawlers when.
			serialize: (item) => {
				const path = new URL(item.url).pathname;
				return path === '/' || hubPaths.has(path) ? { ...item, lastmod: lastScan } : item;
			},
		}),
	],
});
