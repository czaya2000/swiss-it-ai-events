/* The public, documented shape of an event, shared by /events.json,
   /llms.txt and /rss.xml. Meant for anyone (people, apps, AI agents) who
   wants the listing as data. Separate from /social-feed.json, which is the
   private contract with the n8n social pipeline and must not change. */
import { SITE_URL, cityGroup, eventUrl, isFree, formatDateRange, type EventEntry } from './events';
import { eventDateTimes } from './ics';
import { feedHttpsUrl, feedSlug, slugify } from './calendar-feeds';

export const DATA_VERSION = 1;

export const SITE_SCOPE =
	'Swiss Data Events (swissdataevents.ch) is a hand-curated list of upcoming IT, data and AI events in Switzerland: ' +
	'meetups, conferences, workshops, networking evenings and webinars about Databricks, Microsoft Fabric, Power BI, ' +
	'the Azure data platform, AI strategy and governance, data governance, data leadership and applied AI. ' +
	'Every listing is checked against the organiser\'s own page before it is published, and the list is refreshed ' +
	'on Mondays, Wednesdays and Fridays. Registration always happens on the organiser\'s site.';

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
	ics: `${SITE_URL}/calendar/all.ics`,
	docs: `${SITE_URL}/data/`,
};
