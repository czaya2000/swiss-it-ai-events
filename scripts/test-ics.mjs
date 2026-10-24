#!/usr/bin/env node
/* Checks the calendar feeds in dist/calendar/ (run `npm run build` first).
   - every file: CRLF only, lines ≤ 75 octets, parses with ical.js, has the
     Europe/Zurich VTIMEZONE, unique UIDs, only upcoming events
   - event counts match what the "Save to my calendar" modal shows
   - a timed event converts to the right UTC instant
   - a changed event keeps its UID
   Usage: npm run test:ics   (needs Node ≥ 22.18 to load src/lib/ics.ts) */
import { readFileSync, readdirSync } from 'node:fs';
import ICAL from 'ical.js';
import { buildCalendar, eventUid } from '../src/lib/ics.ts';

const root = new URL('../', import.meta.url);
const dir = new URL('dist/calendar/', root);
const events = JSON.parse(readFileSync(new URL('src/data/events.json', root), 'utf8'));
const byId = new Map(events.map((e) => [e.id, e]));
const today = new Date().toISOString().slice(0, 10);
const html = readFileSync(new URL('dist/index.html', root), 'utf8');
const modalCounts = JSON.parse(html.match(/<script type="application\/json" id="cal-feeds">(.*?)<\/script>/s)[1]);

let failures = 0;
const fail = (msg) => {
	failures++;
	console.error('  ✗ ' + msg);
};
const enc = new TextEncoder();

const files = readdirSync(dir).filter((f) => f.endsWith('.ics')).sort();
console.log(`${files.length} feed files in dist/calendar/`);

for (const file of files) {
	const text = readFileSync(new URL(file, dir), 'utf8');
	const slug = file.replace(/\.ics$/, '');

	if (/[^\r]\n/.test(text) || /\r(?!\n)/.test(text)) fail(`${file}: line ending that is not CRLF`);
	if (!text.endsWith('\r\n')) fail(`${file}: does not end with CRLF`);
	text.split('\r\n').forEach((line, i) => {
		const n = enc.encode(line).length;
		if (n > 75) fail(`${file}:${i + 1}: ${n} octets`);
	});

	let cal;
	try {
		cal = new ICAL.Component(ICAL.parse(text));
	} catch (err) {
		fail(`${file}: ical.js could not parse it: ${err.message}`);
		continue;
	}
	const tz = cal.getFirstSubcomponent('vtimezone');
	if (!tz || tz.getFirstPropertyValue('tzid') !== 'Europe/Zurich') fail(`${file}: no Europe/Zurich VTIMEZONE`);
	for (const p of ['x-wr-calname', 'x-published-ttl', 'refresh-interval']) {
		if (!cal.getFirstPropertyValue(p)) fail(`${file}: missing ${p.toUpperCase()}`);
	}

	const vevents = cal.getAllSubcomponents('vevent');
	const uids = vevents.map((v) => v.getFirstPropertyValue('uid'));
	if (new Set(uids).size !== uids.length) fail(`${file}: duplicate UIDs`);
	for (const v of vevents) {
		const uid = v.getFirstPropertyValue('uid');
		const src = byId.get(uid.replace(/@swissdataevents\.ch$/, ''));
		if (!src) fail(`${file}: ${uid} is not in events.json`);
		else if ((src.endDate ?? src.date) < today) fail(`${file}: ${uid} is already over`);
		for (const p of ['dtstamp', 'dtstart', 'dtend', 'summary', 'description', 'url']) {
			if (!v.hasProperty(p)) fail(`${file}: ${uid} missing ${p.toUpperCase()}`);
		}
		const start = v.getFirstProperty('dtstart');
		if (start.type === 'date-time' && start.getParameter('tzid') !== 'Europe/Zurich') {
			fail(`${file}: ${uid} timed DTSTART without TZID=Europe/Zurich`);
		}
	}

	const expected = modalCounts[slug]?.count;
	if (expected !== vevents.length) fail(`${file}: ${vevents.length} events, modal says ${expected}`);
}

const missing = Object.keys(modalCounts).filter((s) => !files.includes(`${s}.ics`));
if (missing.length) fail(`modal offers feeds with no file: ${missing.join(', ')}`);

// Timezone sanity: 17:30 Zurich on 2026-10-29 (CET, after DST ends) is 16:30 UTC;
// on 2026-10-22 (CEST) it is 15:30 UTC.
{
	const base = { id: 'tz-check', title: 'TZ', time: '17:30–19:00', city: 'Zurich', organiser: 'x', blurb: 'x', pageUrl: 'https://swissdataevents.ch/' };
	const cal = new ICAL.Component(
		ICAL.parse(buildCalendar('t', [{ ...base, date: '2026-10-29' }, { ...base, id: 'tz-check-2', date: '2026-10-22' }])),
	);
	ICAL.TimezoneService.register(cal.getFirstSubcomponent('vtimezone'));
	const [winter, summer] = cal.getAllSubcomponents('vevent').map((v) => new ICAL.Event(v).startDate.toJSDate().toISOString());
	if (winter !== '2026-10-29T16:30:00.000Z') fail(`CET conversion gave ${winter}`);
	if (summer !== '2026-10-22T15:30:00.000Z') fail(`CEST conversion gave ${summer}`);
}

// UID stability: correcting an event's title, date, time and URL keeps its UID.
{
	const before = { id: 'zurich-ai-meetup-2026', title: 'Zurich AI Meetup', date: '2026-11-10', time: '18:00', city: 'Zurich', organiser: 'x', blurb: 'x', pageUrl: 'https://swissdataevents.ch/events/zurich-ai-meetup-2026/' };
	const after = { ...before, title: 'Zurich AI Meetup (moved)', date: '2026-11-17', time: '18:30–20:30', venue: 'New venue', pageUrl: 'https://example.org/changed' };
	const uidOf = (e) => new ICAL.Component(ICAL.parse(buildCalendar('t', [e]))).getFirstSubcomponent('vevent').getFirstPropertyValue('uid');
	if (uidOf(before) !== uidOf(after)) fail('UID changed when the event was edited');
	if (uidOf(before) !== eventUid(before.id)) fail('UID is not built from the event id');
}

if (failures) {
	console.error(`\n${failures} problem(s).`);
	process.exit(1);
}
console.log('OK — all feeds valid, counts match the modal, timezone correct, UIDs stable.');
