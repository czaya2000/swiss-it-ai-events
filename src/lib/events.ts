import { getCollection, type CollectionEntry } from 'astro:content';

export const NEW_WINDOW_DAYS = 5;
export const SITE_URL = 'https://swissdataevents.ch';
export const SITE_NAME = 'Swiss Data Events';
export const SITE_TAGLINE =
	"A curated, hand-verified list of upcoming data, AI, and IT events across Switzerland. No noise, no expired listings — just what's worth your time.";

export type EventEntry = CollectionEntry<'events'>;

export function today(): string {
	return new Date().toISOString().slice(0, 10);
}

export function isNew(firstSeen: string, ref = today()): boolean {
	const ageMs = Date.parse(ref) - Date.parse(firstSeen);
	return ageMs >= 0 && ageMs <= NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export async function getUpcomingEvents(): Promise<EventEntry[]> {
	const entries = await getCollection('events');
	const t = today();
	return entries
		.filter((e) => (e.data.endDate ?? e.data.date) >= t)
		.sort((a, b) => a.data.date.localeCompare(b.data.date));
}

const WEEKDAY = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'short' });
const DATE_RANGE_OPTS: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

export function dateSpine(date: string) {
	const d = new Date(`${date}T00:00:00`);
	return {
		weekday: WEEKDAY.format(d),
		day: d.getDate(),
		month: MONTH.format(d),
	};
}

export function formatDateRange(date: string, endDate?: string) {
	const start = new Date(date).toLocaleDateString('en-GB', DATE_RANGE_OPTS);
	if (!endDate || endDate === date) return start;
	const end = new Date(endDate).toLocaleDateString('en-GB', DATE_RANGE_OPTS);
	return `${start} – ${end}`;
}

export function isFree(cost: string): boolean {
	return /\bfree\b/i.test(cost);
}

export function eventUrl(slug: string): string {
	return `${SITE_URL}/events/${slug}/`;
}
