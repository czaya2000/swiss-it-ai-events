import type { APIRoute } from 'astro';
import meta from '../data/meta.json';
import { SITE_NAME, SITE_URL, getUpcomingEvents } from '../lib/events';
import { ENDPOINTS, SITE_SCOPE, freshnessLine, hubMarkdownPath } from '../lib/public-data';
import { HUBS, hubCount, isHubLive } from '../lib/hubs.mjs';

/* /llms.txt (https://llmstxt.org): a short map of the site for AI agents.
   It says what the site is, when the data was last checked, and where the
   events are. The events themselves are in /llms-full.txt and in one list
   per city and type, so this file stays small enough to be read whole and
   an old cached copy of it carries no out-of-date events. Rebuilt on every
   refresh. */

export const GET: APIRoute = async () => {
	const upcoming = (await getUpcomingEvents()).map((e) => e.data);
	// The city and type lists with enough events to be worth a link.
	const hubLines = HUBS.filter((h) => isHubLive(h, upcoming)).map(
		(h) =>
			`- [${h.h1}](${SITE_URL}${hubMarkdownPath(h)}): ${hubCount(h, upcoming)} upcoming ${h.many} ${h.where}${h.nearby ? `, including ${h.nearby}` : ''}`,
	);

	const lines: string[] = [
		`# ${SITE_NAME}`,
		'',
		`> ${SITE_SCOPE}`,
		'',
		freshnessLine(meta.lastScan, upcoming.length),
		'',
		'Each event has its own page on this site with the date, time, place, cost, organiser and a link to the organiser\'s registration page. Details can change on the organiser\'s side, so the organiser\'s page is the final word.',
		'',
		'## Events',
		'',
		`- [All upcoming events](${ENDPOINTS.llmsFull}): the complete list by month, one line per event with date, time, place, type, cost, organiser and a one-sentence description`,
		...hubLines,
		'',
		'## Data',
		'',
		`- [All upcoming events as JSON](${ENDPOINTS.json}): one object per event with ISO 8601 start/end, city, format, topics, cost, organiser and links`,
		`- [RSS feed](${ENDPOINTS.rss}): upcoming events, newest listings first`,
		`- [Calendar feed (iCalendar)](${ENDPOINTS.ics}): subscribe in Google, Outlook or Apple Calendar; per-city and per-format feeds are listed on the data page`,
		`- [About the data](${ENDPOINTS.docs}): field descriptions and usage notes`,
		'',
		'## Optional',
		'',
		`- [Home](${SITE_URL}/): the full list as a web page, grouped by week, filterable by city and format`,
		`- [Contact](${SITE_URL}/contact/)`,
		'',
	];

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
