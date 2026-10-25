/* Hand-written iCalendar (RFC 5545) writer for the calendar subscription
   feeds under /calendar/. Deliberately free of Astro imports so the test
   script (scripts/test-ics.mjs) can load it straight into Node.

   Written by hand because the `ics` npm package cannot emit TZID-qualified
   times with a VTIMEZONE block, and local Swiss times are the point. */

export interface IcsEvent {
	id: string;
	title: string;
	date: string; // YYYY-MM-DD
	endDate?: string;
	time?: string; // free text, e.g. "17:30–19:00", "Fri from 17:00"
	city: string;
	venue?: string;
	organiser: string;
	blurb: string;
	pageUrl: string; // the event's page on swissdataevents.ch
}

export const UID_DOMAIN = 'swissdataevents.ch';
const TZID = 'Europe/Zurich';
/** Events spanning this many days or more show on their first day only. */
const LONG_SPAN_DAYS = 7;
/** Assumed length when only a start time is known. */
const DEFAULT_MINUTES = 120;

// Europe/Zurich since 1996: CEST from the last Sunday of March, CET from the
// last Sunday of October.
const VTIMEZONE = [
	'BEGIN:VTIMEZONE',
	`TZID:${TZID}`,
	`X-LIC-LOCATION:${TZID}`,
	'BEGIN:DAYLIGHT',
	'TZOFFSETFROM:+0100',
	'TZOFFSETTO:+0200',
	'TZNAME:CEST',
	'DTSTART:19810329T020000',
	'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
	'END:DAYLIGHT',
	'BEGIN:STANDARD',
	'TZOFFSETFROM:+0200',
	'TZOFFSETTO:+0100',
	'TZNAME:CET',
	'DTSTART:19961027T030000',
	'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
	'END:STANDARD',
	'END:VTIMEZONE',
];

/** UID is the event's slug, which never changes when its title, date, time
    or URL is corrected, so a calendar app updates the entry in place. */
export function eventUid(id: string): string {
	return `${id}@${UID_DOMAIN}`;
}

/** TEXT value escaping (RFC 5545 §3.3.11). */
export function escapeText(s: string): string {
	return s
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\r\n|\r|\n/g, '\\n');
}

const encoder = new TextEncoder();

/** Fold a content line at 75 octets (§3.1), never splitting a UTF-8 character. */
export function foldLine(line: string): string {
	const out: string[] = [];
	let current = '';
	let bytes = 0;
	let limit = 75;
	for (const ch of line) {
		const n = encoder.encode(ch).length;
		if (bytes + n > limit) {
			out.push(current);
			current = ' ';
			bytes = 1;
			limit = 75;
		}
		current += ch;
		bytes += n;
	}
	out.push(current);
	return out.join('\r\n');
}

function compactDate(iso: string): string {
	return iso.replace(/-/g, '');
}

function addDays(iso: string, days: number): string {
	const d = new Date(`${iso}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
	return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

/** Local wall-clock date-time as YYYYMMDDTHHMMSS, rolling past midnight. */
function localStamp(iso: string, minutes: number): string {
	const day = addDays(iso, Math.floor(minutes / 1440));
	const m = ((minutes % 1440) + 1440) % 1440;
	const hh = String(Math.floor(m / 60)).padStart(2, '0');
	const mm = String(m % 60).padStart(2, '0');
	return `${compactDate(day)}T${hh}${mm}00`;
}

function utcStamp(d: Date): string {
	return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** First "HH:MM" in the text, plus an end time if it reads as a range. */
export function parseTime(text?: string): { start: number; end?: number } | null {
	if (!text) return null;
	const toMin = (h: string, m: string) => Number(h) * 60 + Number(m);
	const range = text.match(/(\d{1,2})[:.](\d{2})\s*(?:[–—-]|to)\s*(\d{1,2})[:.](\d{2})/);
	if (range) {
		const start = toMin(range[1], range[2]);
		let end = toMin(range[3], range[4]);
		if (start >= 1440) return null;
		if (end <= start) end += 1440; // runs past midnight
		return { start, end };
	}
	const single = text.match(/(\d{1,2})[:.](\d{2})/);
	if (!single) return null;
	const start = toMin(single[1], single[2]);
	return start < 1440 ? { start } : null;
}

/** YYYY-MM-DD of the last Sunday of a month (month is 1-based). */
function lastSunday(year: number, month: number): string {
	const d = new Date(Date.UTC(year, month, 0)); // last day of `month`
	d.setUTCDate(d.getUTCDate() - d.getUTCDay());
	return d.toISOString().slice(0, 10);
}

/** Europe/Zurich UTC offset on a given local date: CEST from the last Sunday
    of March, CET from the last Sunday of October (same rule as VTIMEZONE). */
export function zurichOffset(iso: string): '+01:00' | '+02:00' {
	const year = Number(iso.slice(0, 4));
	return iso >= lastSunday(year, 3) && iso < lastSunday(year, 10) ? '+02:00' : '+01:00';
}

/** ISO 8601 local date-time with the Zurich offset, e.g. 2026-10-29T17:30:00+01:00. */
export function isoDateTime(iso: string, minutes: number): string {
	const day = addDays(iso, Math.floor(minutes / 1440));
	const m = ((minutes % 1440) + 1440) % 1440;
	const hh = String(Math.floor(m / 60)).padStart(2, '0');
	const mm = String(m % 60).padStart(2, '0');
	return `${day}T${hh}:${mm}:00${zurichOffset(day)}`;
}

/** Start and end as schema.org-style values: date-times when the time can be
    parsed (single-day events only), plain dates otherwise. */
export function eventDateTimes(e: { date: string; endDate?: string; time?: string }): {
	start: string;
	end: string;
} {
	const multiDay = !!e.endDate && e.endDate !== e.date;
	const time = multiDay ? null : parseTime(e.time);
	if (!time) return { start: e.date, end: e.endDate ?? e.date };
	return {
		start: isoDateTime(e.date, time.start),
		end: isoDateTime(e.date, time.end ?? time.start + DEFAULT_MINUTES),
	};
}

const SHORT_DATE =new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function eventLines(e: IcsEvent, dtstamp: string): string[] {
	const end = e.endDate && e.endDate !== e.date ? e.endDate : undefined;
	const span = end ? daysBetween(e.date, end) : 0;
	const longSpan = span >= LONG_SPAN_DAYS;
	const time = parseTime(e.time);

	const lines = ['BEGIN:VEVENT', `UID:${eventUid(e.id)}`, `DTSTAMP:${dtstamp}`];

	if (end && !longSpan) {
		// Multi-day (up to a week): an all-day block; DTEND is exclusive.
		lines.push(`DTSTART;VALUE=DATE:${compactDate(e.date)}`);
		lines.push(`DTEND;VALUE=DATE:${compactDate(addDays(end, 1))}`);
	} else if (time) {
		const endMin = time.end ?? time.start + DEFAULT_MINUTES;
		lines.push(`DTSTART;TZID=${TZID}:${localStamp(e.date, time.start)}`);
		lines.push(`DTEND;TZID=${TZID}:${localStamp(e.date, endMin)}`);
	} else {
		lines.push(`DTSTART;VALUE=DATE:${compactDate(e.date)}`);
		lines.push(`DTEND;VALUE=DATE:${compactDate(addDays(e.date, 1))}`);
	}

	const online = /^online\b/i.test(e.city);
	// Don't repeat the city when the venue already names it.
	const venueHasCity = !!e.venue && e.venue.toLowerCase().includes(e.city.toLowerCase());
	const location = online ? 'Online' : venueHasCity ? e.venue! : [e.venue, e.city].filter(Boolean).join(', ');

	const desc: string[] = [e.blurb];
	if (longSpan && end) {
		desc.push(`Runs until ${SHORT_DATE.format(new Date(`${end}T00:00:00Z`))} — see the event page for session dates.`);
	}
	desc.push(`Organiser: ${e.organiser}`);
	desc.push(`Details and registration: ${e.pageUrl}`);

	lines.push(`SUMMARY:${escapeText(e.title)}`);
	if (location) lines.push(`LOCATION:${escapeText(location)}`);
	lines.push(`DESCRIPTION:${escapeText(desc.join('\n\n'))}`);
	lines.push(`URL:${e.pageUrl}`);
	lines.push('SEQUENCE:0');
	lines.push('TRANSP:TRANSPARENT');
	lines.push('END:VEVENT');
	return lines;
}

/** A complete VCALENDAR with CRLF line endings and folded lines. */
export function buildCalendar(name: string, events: IcsEvent[], now = new Date()): string {
	const dtstamp = utcStamp(now);
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Swiss Data Events//Calendar feed//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		`X-WR-CALNAME:${escapeText(name)}`,
		`X-WR-CALDESC:${escapeText('Upcoming data, AI and IT events in Switzerland, from swissdataevents.ch')}`,
		`X-WR-TIMEZONE:${TZID}`,
		'X-PUBLISHED-TTL:PT12H',
		'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
		...VTIMEZONE,
		...events.flatMap((e) => eventLines(e, dtstamp)),
		'END:VCALENDAR',
	];
	return lines.map(foldLine).join('\r\n') + '\r\n';
}
