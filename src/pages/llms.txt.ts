import type { APIRoute } from 'astro';
import meta from '../data/meta.json';
import { SITE_NAME, SITE_URL, getUpcomingEvents } from '../lib/events';
import { ENDPOINTS, SITE_SCOPE, publicEvent } from '../lib/public-data';
import { HUBS, hubCount, isHubLive } from '../lib/hubs.mjs';

/* /llms.txt (https://llmstxt.org): a plain-markdown summary of the site for
   AI agents, with every upcoming event inline so an agent can answer
   "what's on in Zurich next week?" from one fetch. Rebuilt on every refresh. */

const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const GET: APIRoute = async () => {
	const upcoming = await getUpcomingEvents();
	const events = upcoming.map(publicEvent);
	// The city and type pages that are live (enough events to be indexed).
	const hubLines = HUBS.filter((h) => isHubLive(h, upcoming.map((e) => e.data))).map(
		(h) =>
			`- [${h.h1}](${SITE_URL}${h.path}): ${hubCount(h, upcoming.map((e) => e.data))} upcoming ${h.many} ${h.where}${h.nearby ? `, including ${h.nearby}` : ''}`,
	);

	const lines: string[] = [
		`# ${SITE_NAME}`,
		'',
		`> ${SITE_SCOPE}`,
		'',
		`Last checked against sources: ${meta.lastScan}. ${events.length} upcoming events. All times are Europe/Zurich.`,
		'',
		'Each event has its own page on this site with the date, time, place, cost, organiser and a link to the organiser\'s registration page. Details can change on the organiser\'s side, so the organiser\'s page is the final word.',
		'',
		'## Data',
		'',
		`- [All upcoming events as JSON](${ENDPOINTS.json}): one object per event with ISO 8601 start/end, city, format, topics, cost, organiser and links`,
		`- [RSS feed](${ENDPOINTS.rss}): upcoming events, newest listings first`,
		`- [Calendar feed (iCalendar)](${ENDPOINTS.ics}): subscribe in Google, Outlook or Apple Calendar; per-city and per-format feeds are listed on the data page`,
		`- [About the data](${ENDPOINTS.docs}): field descriptions and usage notes`,
		'',
		'## Pages',
		'',
		`- [Home: upcoming events](${SITE_URL}/): the full list, grouped by week, filterable by city and format`,
		...hubLines,
		`- [Contact](${SITE_URL}/contact/)`,
		'',
		'## Upcoming events',
	];

	let month = '';
	for (const e of events) {
		const m = MONTH.format(new Date(`${e.start.slice(0, 10)}T00:00:00Z`));
		if (m !== month) {
			month = m;
			lines.push('', `### ${m}`, '');
		}
		const time = e.time ? `, ${e.time}` : '';
		const where = e.online ? 'Online' : [e.venue, e.city].filter(Boolean).join(', ');
		lines.push(
			`- [${e.title}](${e.url}): ${e.dateLabel}${time} · ${where} · ${e.format} · ${e.cost} · by ${e.organiser}. ${e.description}`,
		);
	}
	lines.push('');

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
