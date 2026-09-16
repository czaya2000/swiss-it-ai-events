// Scrapes meetup.com listing pages for the daily refresh.
//
// Meetup's listing pages are client-rendered and return nothing useful to a plain
// fetch, so they need a real browser. This does one pass per URL and prints every
// event link with its visible card text (title, date, sometimes venue) — usually
// enough on its own, so the refresh only has to open an individual event page when
// a field it actually needs is still missing.
//
// Works for both kinds of URL in SOURCES.md:
//   node scripts/scrape-meetup.mjs https://www.meetup.com/pydata-zurich/events/
//   node scripts/scrape-meetup.mjs "https://www.meetup.com/find/?keywords=AI&location=ch--Z%C3%BCrich"
//
// Prints a JSON array to stdout, one entry per URL. A URL that fails is reported
// with `ok: false` and its error rather than silently returning nothing; the exit
// code is non-zero only when every URL failed, so one dead source doesn't fail the run.

import { chromium } from 'playwright';

const PAGE_TIMEOUT_MS = 45_000;
const SETTLE_MS = 2_500;

// Cards lead with title | date | venue and then run on into the full agenda, which is
// far more than the refresh needs across ~17 URLs. Keep the useful head, drop the rest.
const MAX_TEXT_CHARS = 500;

/**
 * Pull event links + their visible card text out of a rendered listing page.
 * Runs inside the browser, so it gets `maxChars` passed in rather than closing over it.
 */
function extractEvents(maxChars) {
	const seen = new Map();

	for (const a of document.querySelectorAll('a[href*="/events/"]')) {
		const href = a.href.split('?')[0].replace(/\/$/, '');

		// Event permalinks end in a numeric id; /events/ index links don't.
		if (!/\/events\/\d+$/.test(href)) continue;

		// The anchor itself is often just the title. Walk up for the card, which
		// usually carries the date and venue too, but stop before we swallow the
		// whole page.
		let node = a;
		for (let i = 0; i < 4; i++) {
			const text = (node.innerText || '').trim();
			if (text.length > 60 || !node.parentElement) break;
			node = node.parentElement;
		}

		const text = (node.innerText || a.innerText || '').trim().replace(/\s*\n\s*/g, ' | ');
		const existing = seen.get(href);
		if (!existing || text.length > existing.length) seen.set(href, text);
	}

	return [...seen].map(([href, text]) => ({
		href,
		text: text.length > maxChars ? `${text.slice(0, maxChars)}…` : text,
	}));
}

async function scrape(browser, url) {
	const context = await browser.newContext({
		locale: 'en-GB',
		timezoneId: 'Europe/Zurich',
	});
	const page = await context.newPage();

	try {
		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT_MS });

		// Listings hydrate after load; wait for a real event link, but treat "no
		// events" as a valid answer rather than an error — most of these groups
		// legitimately have nothing scheduled.
		await page
			.waitForSelector('a[href*="/events/"]', { timeout: 15_000 })
			.catch(() => {});
		await page.waitForTimeout(SETTLE_MS);

		const events = await page.evaluate(extractEvents, MAX_TEXT_CHARS);
		return { url, ok: true, count: events.length, events };
	} catch (error) {
		return { url, ok: false, count: 0, events: [], error: error.message };
	} finally {
		await context.close();
	}
}

const urls = process.argv.slice(2);

if (urls.length === 0) {
	console.error('usage: node scripts/scrape-meetup.mjs <meetup-url> [more-urls...]');
	process.exit(2);
}

const browser = await chromium.launch();
const results = [];

try {
	for (const url of urls) {
		results.push(await scrape(browser, url));
	}
} finally {
	await browser.close();
}

console.log(JSON.stringify(results, null, 2));

const failed = results.filter((r) => !r.ok);
if (failed.length === results.length) {
	console.error(`All ${results.length} meetup URL(s) failed to load.`);
	process.exit(1);
}
if (failed.length > 0) {
	console.error(`${failed.length} of ${results.length} meetup URL(s) failed: ${failed.map((r) => r.url).join(', ')}`);
}
