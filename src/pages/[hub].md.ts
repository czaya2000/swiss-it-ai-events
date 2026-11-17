import type { APIRoute } from 'astro';
import meta from '../data/meta.json';
import { SITE_NAME, SITE_URL, getUpcomingEvents } from '../lib/events';
import { ENDPOINTS, MD_LIST_BUDGET, eventsMarkdown, freshnessLine, publicEvent } from '../lib/public-data';
import { HUBS } from '../lib/hubs.mjs';

/* /zurich.md, /conferences.md and so on: the markdown copy of each city and
   type page (src/pages/[hub]/index.astro), for AI agents. One per hub in
   src/lib/hubs.mjs, so a link never 404s; /llms.txt links the ones with
   enough events. Not in the sitemap: the HTML page is the one to index. */

export function getStaticPaths() {
	return HUBS.map((hub) => ({ params: { hub: hub.slug } }));
}

export const GET: APIRoute = async ({ params }) => {
	const hub = HUBS.find((h) => h.slug === params.hub)!;
	const events = (await getUpcomingEvents()).filter((e) => hub.matches(e.data)).map(publicEvent);
	const n = events.length;

	const page = (withDescription: boolean) =>
		[
			`# ${hub.h1}`,
			'',
			`> ${n === 0 ? `No upcoming ${hub.many}` : `${n} upcoming ${n === 1 ? hub.one : hub.many}`} ${hub.where}${hub.nearby ? `, including ${hub.nearby}` : ''}, from ${SITE_NAME} (swissdataevents.ch). Each listing is checked against the organiser's own page.`,
			'',
			`Canonical: ${SITE_URL}${hub.path}`,
			'',
			freshnessLine(meta.lastScan, n),
			'',
			`Every event links to its page on this site, which has the organiser's registration link. All cities and types: [llms.txt](${ENDPOINTS.llms}). Every upcoming event: [llms-full.txt](${ENDPOINTS.llmsFull}). Structured data: [events.json](${ENDPOINTS.json}).`,
			'',
			'## Upcoming events',
			...eventsMarkdown(events, withDescription),
			'',
		].join('\n');

	// Keep the whole list readable in one fetch: see MD_LIST_BUDGET.
	const full = page(true);
	const body = full.length <= MD_LIST_BUDGET ? full : page(false);

	return new Response(body, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
};
