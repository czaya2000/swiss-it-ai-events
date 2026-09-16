// Validates src/data/events.json before anything is committed or deployed.
//
// The Astro collection schema (src/content.config.ts) types `date`/`endDate` as bare
// strings, so a malformed date passes the build and only shows up later as broken
// sorting on the live site. This checks the things the schema can't, and runs in CI
// between the refresh and the push.
//
//   node scripts/validate-events.mjs
//   node scripts/validate-events.mjs --require-fresh
//
// --require-fresh additionally demands that lastScan was bumped in the last few hours.
// CI uses it because a refresh that quietly changes nothing is the failure mode this
// whole setup exists to prevent: without it the job deploys stale data and goes green,
// and the only symptom is an old date in the site footer.
//
// Exits non-zero and lists every problem it found.

import { readFileSync } from 'node:fs';

const EVENTS_PATH = 'src/data/events.json';
const META_PATH = 'src/data/meta.json';

const FORMATS = ['Meetup', 'Conference', 'Workshop', 'Networking', 'Webinar'];
const REQUIRED = [
	'id', 'title', 'date', 'city', 'format',
	'topics', 'organiser', 'cost', 'url', 'source', 'blurb', 'firstSeen',
];

const requireFresh = process.argv.includes('--require-fresh');
const MAX_SCAN_AGE_HOURS = 6;

const errors = [];
const fail = (msg) => errors.push(msg);

/** YYYY-MM-DD that is also a real calendar date (rejects 2026-02-30). */
function isIsoDate(value) {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

let events;
try {
	events = JSON.parse(readFileSync(EVENTS_PATH, 'utf8'));
} catch (error) {
	console.error(`${EVENTS_PATH}: not valid JSON — ${error.message}`);
	process.exit(1);
}

if (!Array.isArray(events)) {
	console.error(`${EVENTS_PATH}: expected a top-level array, got ${typeof events}`);
	process.exit(1);
}
if (events.length === 0) {
	console.error(`${EVENTS_PATH}: empty — refusing to deploy a site with no events`);
	process.exit(1);
}

const seenIds = new Set();

events.forEach((event, i) => {
	const label = `events[${i}] (${event?.id ?? 'no id'})`;

	if (typeof event !== 'object' || event === null) {
		fail(`${label}: not an object`);
		return;
	}

	for (const field of REQUIRED) {
		if (event[field] === undefined || event[field] === null || event[field] === '') {
			fail(`${label}: missing required field "${field}"`);
		}
	}

	if (event.id !== undefined) {
		if (seenIds.has(event.id)) fail(`${label}: duplicate id "${event.id}"`);
		seenIds.add(event.id);
	}

	if (event.format !== undefined && !FORMATS.includes(event.format)) {
		fail(`${label}: format "${event.format}" is not one of ${FORMATS.join(', ')}`);
	}

	if (event.topics !== undefined && !Array.isArray(event.topics)) {
		fail(`${label}: topics must be an array`);
	}

	for (const field of ['date', 'endDate', 'firstSeen']) {
		if (event[field] !== undefined && !isIsoDate(event[field])) {
			fail(`${label}: ${field} "${event[field]}" is not a valid YYYY-MM-DD date`);
		}
	}

	if (isIsoDate(event.date) && isIsoDate(event.endDate) && event.endDate < event.date) {
		fail(`${label}: endDate ${event.endDate} is before date ${event.date}`);
	}

	if (event.url !== undefined) {
		try {
			new URL(event.url);
		} catch {
			fail(`${label}: url "${event.url}" is not a valid URL`);
		}
	}
});

// meta.json drives the site's "Last scanned" line and must be refreshed every run,
// so a stale or malformed timestamp is a real failure, not a cosmetic one.
try {
	const meta = JSON.parse(readFileSync(META_PATH, 'utf8'));
	const scanned = new Date(meta.lastScan);
	if (Number.isNaN(scanned.getTime())) {
		fail(`${META_PATH}: lastScan "${meta.lastScan}" is not a valid timestamp`);
	} else if (scanned > new Date(Date.now() + 60 * 60 * 1000)) {
		fail(`${META_PATH}: lastScan "${meta.lastScan}" is in the future`);
	} else if (requireFresh) {
		const ageHours = (Date.now() - scanned.getTime()) / 3_600_000;
		if (ageHours > MAX_SCAN_AGE_HOURS) {
			fail(
				`${META_PATH}: lastScan "${meta.lastScan}" is ${ageHours.toFixed(1)}h old — ` +
				`the refresh did not update it, so this run did no work. Refusing to deploy stale data.`,
			);
		}
	}
} catch (error) {
	fail(`${META_PATH}: ${error.message}`);
}

if (errors.length > 0) {
	console.error(`${errors.length} problem(s) found:\n`);
	for (const error of errors) console.error(`  - ${error}`);
	process.exit(1);
}

console.log(`OK — ${events.length} events valid.`);
