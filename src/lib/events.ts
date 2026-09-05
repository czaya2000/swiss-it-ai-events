import { getCollection, type CollectionEntry } from 'astro:content';

export const NEW_WINDOW_DAYS = 5;
export const SITE_URL = 'https://swissdataevents.ch';
export const SITE_NAME = 'Swiss Data Events';
export const SITE_TAGLINE =
	"A curated, hand-verified list of upcoming data, AI, and IT events across Switzerland. No noise, no expired listings — just what's worth your time.";

/* Contact, digest-signup and event-submission forms all post to FormSubmit
   (no backend), which forwards to this inbox. The `_subject` field on each
   form says which one it came from. */
export const FORM_ENDPOINT = 'https://formsubmit.co/czajkowski81@gmail.com';

/* Google Search Console "HTML tag" verification. Paste the `content="…"`
   value from Search Console here; an empty string renders no tag. */
export const GOOGLE_SITE_VERIFICATION = '';

export type EventEntry = CollectionEntry<'events'>;

/** Registration links carry UTM tags so organisers can see in their own
    analytics how many registrations this site sent them — the number a
    featured listing is eventually sold on. Existing params and fragments
    are preserved; anything that is not an http(s) URL is returned as-is. */
export function outboundUrl(url: string): string {
	try {
		const u = new URL(url);
		if (u.protocol !== 'http:' && u.protocol !== 'https:') return url;
		if (!u.searchParams.has('utm_source')) {
			u.searchParams.set('utm_source', 'swissdataevents.ch');
			u.searchParams.set('utm_medium', 'referral');
			u.searchParams.set('utm_campaign', 'listing');
		}
		return u.toString();
	} catch {
		return url;
	}
}

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

const LAST_SCAN_FMT = new Intl.DateTimeFormat('en-GB', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'Europe/Zurich',
});

export function formatLastScan(iso: string): string {
	return `${LAST_SCAN_FMT.format(new Date(iso))} Europe/Zurich`;
}

/* ---- Week grouping -------------------------------------------------- */

/* The listing groups events under the week they start in. Week numbers are
   deliberately NOT shown — outside logistics nobody reads "week 37" — so a
   band is labelled by its date range, or by "This week" / "Next week" when
   that is the more useful thing to say. */

export const SITE_HEADLINE = 'Every IT and AI event in Switzerland, checked by hand.';

const BAND_DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric' });
const BAND_DAY_MONTH = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' });

/** Monday of the ISO week containing `date`, as YYYY-MM-DD. */
export function weekStart(date: string): string {
	const d = new Date(`${date}T00:00:00`);
	const shift = (d.getDay() + 6) % 7; // Monday = 0
	d.setDate(d.getDate() - shift);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(date: string, n: number): Date {
	const d = new Date(`${date}T00:00:00`);
	d.setDate(d.getDate() + n);
	return d;
}

/** "7 – 13 September", or "28 September – 4 October" across a month boundary. */
export function weekRangeLabel(mondayISO: string): string {
	const start = new Date(`${mondayISO}T00:00:00`);
	const end = addDays(mondayISO, 6);
	const sameMonth = start.getMonth() === end.getMonth();
	const left = sameMonth ? BAND_DAY.format(start) : BAND_DAY_MONTH.format(start);
	return `${left} – ${BAND_DAY_MONTH.format(end)}`;
}

export interface WeekBand {
	key: string;
	primary: string;
	secondary: string;
	current: boolean;
}

export function weekBand(mondayISO: string, ref = today()): WeekBand {
	const thisWeek = weekStart(ref);
	const nextWeek = weekStart(
		`${addDays(thisWeek, 7).getFullYear()}-${String(addDays(thisWeek, 7).getMonth() + 1).padStart(2, '0')}-${String(addDays(thisWeek, 7).getDate()).padStart(2, '0')}`
	);
	const range = weekRangeLabel(mondayISO);
	if (mondayISO === thisWeek) {
		return { key: mondayISO, primary: 'This week', secondary: range, current: true };
	}
	if (mondayISO === nextWeek) {
		return { key: mondayISO, primary: range, secondary: 'Next week', current: false };
	}
	return { key: mondayISO, primary: range, secondary: '', current: false };
}
