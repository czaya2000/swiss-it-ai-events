// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://swissdataevents.ch',
	integrations: [
		sitemap({
			// Post-submit confirmation pages are dead ends for search.
			filter: (page) => !page.includes('/thanks/'),
		}),
	],
});
