import type { APIRoute } from 'astro';
import meta from '../data/meta.json';
import { SITE_NAME, SITE_URL, getUpcomingEvents } from '../lib/events';
import { DATA_VERSION, ENDPOINTS, SITE_SCOPE, publicEvent } from '../lib/public-data';

/* Public JSON of every upcoming event, documented at /data/. Field names
   are a promise: add fields freely, but never rename or remove one without
   bumping DATA_VERSION. */
export const GET: APIRoute = async () => {
	const events = (await getUpcomingEvents()).map(publicEvent);
	const body = {
		version: DATA_VERSION,
		name: SITE_NAME,
		site: SITE_URL,
		description: SITE_SCOPE,
		documentation: ENDPOINTS.docs,
		license: 'Free to read, cite and link. Please link back to the event page (url) when you reuse a listing.',
		generatedAt: new Date().toISOString(),
		lastScan: meta.lastScan,
		count: events.length,
		events,
	};
	return new Response(JSON.stringify(body, null, 2), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
};
