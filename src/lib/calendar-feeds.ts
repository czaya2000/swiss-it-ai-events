import { SITE_NAME, SITE_URL, cityGroup, eventUrl, type EventEntry } from './events';
import type { IcsEvent } from './ics';

/* One calendar feed per filter combination: all events, each city, each
   format, and each non-empty city × format pair. Built at `astro build`
   by src/pages/calendar/[feed].ics.ts, and listed in the "Save to my
   calendar" modal (src/components/CalendarSubscribe.astro). */

export interface Feed {
	slug: string; // file name without .ics
	name: string; // X-WR-CALNAME
	city: string; // city slug, or '' for all
	format: string; // format slug, or '' for all
	events: EventEntry[];
}

export interface FeedOption {
	slug: string;
	label: string;
}

/** "Zürich" → "zurich", "Online (CH)" → "online-ch". */
export function slugify(s: string): string {
	return s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function feedSlug(city: string, format: string): string {
	return [city, format].filter(Boolean).join('__') || 'all';
}

export function feedPath(slug: string): string {
	return `/calendar/${slug}.ics`;
}

export function feedHttpsUrl(slug: string): string {
	return `${SITE_URL}${feedPath(slug)}`;
}

export function toIcsEvent(e: EventEntry): IcsEvent {
	return {
		id: e.id,
		title: e.data.title,
		date: e.data.date,
		endDate: e.data.endDate,
		time: e.data.time,
		city: e.data.city,
		venue: e.data.venue,
		organiser: e.data.organiser,
		blurb: e.data.blurb,
		pageUrl: eventUrl(e.id),
	};
}

function options(values: string[]): FeedOption[] {
	return [...new Set(values)].sort().map((label) => ({ slug: slugify(label), label }));
}

export function feedOptions(events: EventEntry[]) {
	return {
		cities: options(events.map((e) => cityGroup(e.data.city))),
		formats: options(events.map((e) => e.data.format)),
	};
}

export function listFeeds(events: EventEntry[]): Feed[] {
	const { cities, formats } = feedOptions(events);
	const cityChoices = [{ slug: '', label: '' }, ...cities];
	const formatChoices = [{ slug: '', label: '' }, ...formats];
	const feeds: Feed[] = [];
	const seen = new Set<string>();

	for (const c of cityChoices) {
		for (const f of formatChoices) {
			const matching = events.filter(
				(e) =>
					(!c.slug || slugify(cityGroup(e.data.city)) === c.slug) &&
					(!f.slug || slugify(e.data.format) === f.slug),
			);
			const slug = feedSlug(c.slug, f.slug);
			// "all" is always written, even if empty, so the link never 404s.
			if (matching.length === 0 && slug !== 'all') continue;
			if (seen.has(slug)) throw new Error(`Duplicate calendar feed slug: ${slug}`);
			seen.add(slug);
			feeds.push({
				slug,
				name: [SITE_NAME, c.label, f.label].filter(Boolean).join(' – '),
				city: c.slug,
				format: f.slug,
				events: matching,
			});
		}
	}
	return feeds;
}
