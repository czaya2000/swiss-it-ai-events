import type { APIRoute } from 'astro';
import meta from '../data/meta.json';
import { SITE_NAME, getUpcomingEvents } from '../lib/events';
import { ENDPOINTS, SITE_SCOPE, eventsMarkdown, freshnessLine, publicEvent } from '../lib/public-data';

/* /llms-full.txt: every upcoming event as plain markdown, one line each,
   for an AI agent that wants the whole catalogue in one fetch. Same events
   as /events.json, from the same build. /llms.txt links here. */

export const GET: APIRoute = async () => {
	const events = (await getUpcomingEvents()).map(publicEvent);

	const lines: string[] = [
		`# ${SITE_NAME}: all upcoming events`,
		'',
		`> ${SITE_SCOPE}`,
		'',
		freshnessLine(meta.lastScan, events.length),
		'',
		`Shorter lists per city and event type are linked from [llms.txt](${ENDPOINTS.llms}). The same events as structured data: [events.json](${ENDPOINTS.json}).`,
		'',
		'## Upcoming events',
		...eventsMarkdown(events),
		'',
	];

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
