// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
				!page.endsWith('social-feed.json'),
		}),
	],
});
