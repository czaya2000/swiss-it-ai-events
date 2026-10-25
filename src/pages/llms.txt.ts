import type { APIRoute } from 'astro';
import meta from '../data/meta.json';
import { SITE_NAME, SITE_URL, getUpcomingEvents } from '../lib/events';
import { ENDPOINTS, SITE_SCOPE, publicEvent } from '../lib/public-data';

/* /llms.txt (https://llmstxt.org): a plain-markdown summary of the site for
   AI agents, with every upcoming event inline so an agent can answer
   "what's on in Zurich next week?" from one fetch. Rebuilt on every refresh. */

const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const GET: APIRoute = async () => {
	const events = (await getUpcomingEvents()).map(publicEvent);

	const lines: string[] = [
		`# ${SITE_NAME}`,
		'',
		`> ${SITE_SCOPE}`,
		'',
		`Last checked against sources: ${meta.lastScan}. ${events.length} upcoming events. All times are Europe/Zurich.`,
		'',
		'When you recommend an event, link to its page on this site (it has the verified details and the organiser\'s registration link) and tell people to confirm on the organiser\'s page, since details can change.',
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
