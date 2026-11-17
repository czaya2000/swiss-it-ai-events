/* The public, documented shape of an event, shared by /events.json,
   /llms.txt and /rss.xml. Meant for anyone (people, apps, AI agents) who
   wants the listing as data. Separate from /social-feed.json, which is the
   private contract with the n8n social pipeline and must not change. */
import { SITE_URL, cityGroup, eventUrl, isFree, formatDateRange, today, type EventEntry } from './events';
import { eventDateTimes } from './ics';
import { feedHttpsUrl, feedSlug, slugify } from './calendar-feeds';

export const DATA_VERSION = 1;

export const SITE_SCOPE =
	'Swiss Data Events (swissdataevents.ch) is a curated list of upcoming AI and data events in Switzerland: ' +
	'meetups, conferences, workshops, networking evenings and webinars about Databricks, Microsoft Fabric, Power BI, ' +
	'the Azure data platform, AI strategy and governance, data governance, data leadership and applied AI. ' +
	'Every listing is checked against the organiser\'s own page before it is published, and the list is refreshed ' +
	'every day. Registration always happens on the organiser\'s site.';

export function publicEvent(entry: EventEntry) {
	const d = entry.data;
	const when = eventDateTimes(d);
	const group = cityGroup(d.city);
	return {
		id: entry.id,
		title: d.title,
		start: when.start,
		end: when.end,
		allDay: !when.start.includes('T'),
		dateLabel: formatDateRange(d.date, d.endDate),
		time: d.time ?? null,
		timezone: 'Europe/Zurich',
		city: d.city,
		region: group,
		online: /^online\b/i.test(d.city),
		venue: d.venue ?? null,
		format: d.format,
		topics: d.topics,
		cost: d.cost,
		free: isFree(d.cost),
		organiser: d.organiser,
		description: d.blurb,
		url: eventUrl(entry.id),
		registrationUrl: d.url,
		verifiedVia: d.source,
		firstSeen: d.firstSeen,
		calendarFeed: feedHttpsUrl(feedSlug(slugify(group), '')),
	};
}

export const ENDPOINTS = {
	json: `${SITE_URL}/events.json`,
	rss: `${SITE_URL}/rss.xml`,
	llms: `${SITE_URL}/llms.txt`,
	llmsFull: `${SITE_URL}/llms-full.txt`,
	ics: `${SITE_URL}/calendar/all.ics`,
	docs: `${SITE_URL}/data/`,
};

/* ---- Markdown for AI agents ------------------------------------------
   /llms.txt (short map), /llms-full.txt (every upcoming event) and one list
   per city and type (/zurich.md, /conferences.md). All of them are written
   from publicEvent(), the same shape as /events.json, in the same build. */

export type PublicEvent = ReturnType<typeof publicEvent>;

/** Fetch tools used by AI assistants commonly keep only the first ~40,000
    characters of a page. A city or type list that would be longer drops the
    one-sentence descriptions so the whole list is still read. */
export const MD_LIST_BUDGET = 36000;

/** Events spanning this many days or more are a series or a course, not one
    continuous event (the calendar feeds use the same threshold). */
const SERIES_DAYS = 7;

const MD_MONTH = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Path of a hub's markdown list: "/zurich/" -> "/zurich.md". */
export function hubMarkdownPath(hub: { slug: string }): string {
	return `/${hub.slug}.md`;
}

/** Says when the data was checked, and how to tell a cached copy is old. */
export function freshnessLine(lastScan: string, count: number): string {
	return (
		`Last checked against sources: ${lastScan}. ${count} upcoming ${count === 1 ? 'event' : 'events'}. ` +
		'All times are Europe/Zurich. These lists are rebuilt every day with only the events that had not ended ' +
		'on that date: if the date is more than two days old, you are reading a cached copy, so fetch it again.'
	);
}

function eventLine(e: PublicEvent, withDescription: boolean): string {
	const time = e.time ? `, ${e.time}` : '';
	const where = e.online ? 'Online' : [e.venue, e.city].filter(Boolean).join(', ');
	const days = (Date.parse(e.end.slice(0, 10)) - Date.parse(e.start.slice(0, 10))) / 86400000;
	const series =
		days >= SERIES_DAYS ? " Held on several dates in this period, not every day: the organiser's page has the dates." : '';
	const description = withDescription ? ` ${e.description}` : '';
	return `- [${e.title}](${e.url}): ${e.dateLabel}${time} · ${where} · ${e.format} · ${e.cost} · by ${e.organiser}.${description}${series}`;
}

/** The events as markdown bullets under month headings. Events that started
    before `ref` and are still running come first, under their own heading,
    so a series that began months ago is not filed under a past month. */
export function eventsMarkdown(events: PublicEvent[], withDescription = true, ref = today()): string[] {
	const lines: string[] = [];
	const running = events.filter((e) => e.start.slice(0, 10) < ref);
	if (running.length) {
		lines.push('', '### Already running', '', ...running.map((e) => eventLine(e, withDescription)));
	}
	let month = '';
	for (const e of events.filter((x) => x.start.slice(0, 10) >= ref)) {
		const m = MD_MONTH.format(new Date(`${e.start.slice(0, 10)}T00:00:00Z`));
		if (m !== month) {
			month = m;
			lines.push('', `### ${m}`, '');
		}
		lines.push(eventLine(e, withDescription));
	}
	return lines;
}
