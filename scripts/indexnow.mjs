// IndexNow: tells Bing (and the other engines behind api.indexnow.org) which
// pages are new or changed, so they are fetched within hours instead of days.
// Google does not use IndexNow; nothing here affects it.
//
//   node scripts/indexnow.mjs --before <old events.json>   pages changed since that copy
//   node scripts/indexnow.mjs --all                        every page in the sitemap
//   ... --submit                                           send it (default: print only)
//
// Run after `astro build`: the built sitemap decides which listing pages are
// indexable. Prints the request body as one line of JSON, or nothing when no
// page changed. The daily workflow prints it in the `refresh` job and sends it
// from the `deploy` job, once the new pages are really live.
//
// The key is public by design: IndexNow checks it against the file
// public/<key>.txt on the site. Changing it means renaming that file too.

import { readFileSync, existsSync } from 'node:fs';
import { HUBS } from '../src/lib/hubs.mjs';

const HOST = 'swissdataevents.ch';
const SITE = `https://${HOST}`;
const KEY = 'c9b0150a3652d9cc13b460423bf177ca';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const eventUrl = (id) => `${SITE}/events/${id}/`;

function sitemapUrls() {
	const path = 'dist/sitemap-0.xml';
	if (!existsSync(path)) throw new Error(`${path} not found: run "npm run build" first.`);
	return [...readFileSync(path, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function changedUrls(beforePath) {
	const before = new Map(readJson(beforePath).map((e) => [e.id, e]));
	const after = new Map(readJson('src/data/events.json').map((e) => [e.id, e]));

	// New, edited, or moved to the archive (its page now says "Past event").
	const touched = [];
	for (const [id, e] of after) {
		const old = before.get(id);
		if (!old) touched.push(e);
		else if (JSON.stringify(old) !== JSON.stringify(e)) touched.push(old, e);
	}
	for (const [id, e] of before) if (!after.has(id)) touched.push(e);
	if (touched.length === 0) return [];

	// The homepage and the city / type pages that list those events, but only
	// the ones in the sitemap (a thin hub is noindex).
	const indexable = new Set(sitemapUrls());
	const listings = [`${SITE}/`, ...HUBS.filter((h) => touched.some((e) => h.matches(e))).map((h) => SITE + h.path)];

	return [...new Set([...touched.map((e) => eventUrl(e.id)), ...listings.filter((u) => indexable.has(u))])];
}

const urlList = flag('--all') ? sitemapUrls() : value('--before') ? changedUrls(value('--before')) : null;
if (urlList === null) {
	console.error('Usage: node scripts/indexnow.mjs (--before <old events.json> | --all) [--submit]');
	process.exit(2);
}

if (urlList.length === 0) {
	console.error('IndexNow: no page changed, nothing to send.');
	process.exit(0);
}

const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList });
console.error(`IndexNow: ${urlList.length} pages.`);

if (flag('--submit')) {
	const res = await fetch(ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
		body,
	});
	console.error(`IndexNow answered ${res.status} ${res.statusText}`);
	if (!res.ok) process.exit(1);
} else {
	console.log(body);
}
