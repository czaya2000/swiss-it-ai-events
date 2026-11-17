#!/usr/bin/env node
/* Checks the files for AI agents in dist/ (run `npm run build` first):
   /llms.txt, /llms-full.txt, the city and type lists (/zurich.md, ...) and
   /events.json.
   - all of them list the same upcoming events as src/data/events.json, and
     nothing that ended before today
   - /llms.txt is short, in the llmstxt.org shape, and every link in every
     file leads to a file that was built
   - each city or type list fits in one fetch
   - a series that started before today is under "Already running", not
     under a past month
   - none of these files is in the sitemap
   Usage: npm run test:agent */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { HUBS, isHubLive } from '../src/lib/hubs.mjs';

const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
const SITE = 'https://swissdataevents.ch';
const today = new Date().toISOString().slice(0, 10);
const LLMS_MAX = 8000; // characters: a map, not a catalogue
const LIST_MAX = 40000; // what a typical assistant fetch tool keeps

let failures = 0;
const fail = (msg) => {
	failures++;
	console.error('  ✗ ' + msg);
};
const read = (path) => readFileSync(new URL(path, dist), 'utf8');

const source = JSON.parse(readFileSync(new URL('src/data/events.json', root), 'utf8'));
const upcoming = source.filter((e) => (e.endDate ?? e.date) >= today);
const json = JSON.parse(read('events.json'));

// A site URL -> the file the build wrote for it.
const builtFile = (url) => {
	const path = decodeURI(new URL(url).pathname);
	return path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);
};
const links = (text) => [...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
const checkLinks = (name, text) => {
	for (const url of links(text)) {
		if (!url.startsWith(SITE + '/')) fail(`${name}: link leaves the site: ${url}`);
		else if (!existsSync(new URL(builtFile(url), dist))) fail(`${name}: link to a page that was not built: ${url}`);
	}
};
const eventUrls = (text) => links(text).filter((u) => u.startsWith(`${SITE}/events/`));
const sameSet = (name, got, want) => {
	const g = new Set(got);
	const w = new Set(want);
	if (got.length !== g.size) fail(`${name}: an event is listed twice`);
	for (const u of w) if (!g.has(u)) fail(`${name}: missing ${u}`);
	for (const u of g) if (!w.has(u)) fail(`${name}: unexpected ${u}`);
};
// Events under a month heading must start in that month; "Already running" must have started.
const checkHeadings = (name, text) => {
	const byUrl = new Map(json.events.map((e) => [e.url, e]));
	const fmt = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
	let heading = '';
	for (const line of text.split('\n')) {
		if (line.startsWith('### ')) heading = line.slice(4);
		const url = line.startsWith('- [') ? eventUrls(line)[0] : undefined;
		const e = url && byUrl.get(url);
		if (!e) continue;
		const day = e.start.slice(0, 10);
		if (heading === 'Already running') {
			if (day >= today) fail(`${name}: ${e.id} is under "Already running" but starts ${day}`);
		} else if (day < today || fmt.format(new Date(`${day}T00:00:00Z`)) !== heading) {
			fail(`${name}: ${e.id} (starts ${day}) is under "${heading}"`);
		}
	}
};
const checkFreshness = (name, text) => {
	const m = text.match(/Last checked against sources: (\S+?)\. (\d+) upcoming/);
	if (!m) return fail(`${name}: no "Last checked against sources" line`);
	if (m[1] !== json.lastScan) fail(`${name}: says ${m[1]}, events.json says ${json.lastScan}`);
	return Number(m[2]);
};

// --- /events.json
const wantUrls = upcoming.map((e) => `${SITE}/events/${e.id}/`);
sameSet('events.json', json.events.map((e) => e.url), wantUrls);
if (json.count !== json.events.length) fail(`events.json: count ${json.count}, ${json.events.length} events`);
for (const e of json.events) {
	if ((e.end ?? e.start).slice(0, 10) < today) fail(`events.json: ${e.id} ended ${e.end}`);
}

// --- /llms.txt
const llms = read('llms.txt');
if (!llms.startsWith('# ')) fail('llms.txt: does not start with an H1');
if (!/^> /m.test(llms)) fail('llms.txt: no blockquote summary');
if (llms.length > LLMS_MAX) fail(`llms.txt: ${llms.length} characters (max ${LLMS_MAX})`);
if (eventUrls(llms).length) fail('llms.txt: lists events (they belong in llms-full.txt)');
if (checkFreshness('llms.txt', llms) !== upcoming.length) fail('llms.txt: wrong event count');
checkLinks('llms.txt', llms);
for (const h of HUBS) {
	const linked = llms.includes(`${SITE}/${h.slug}.md`);
	if (linked !== isHubLive(h, upcoming)) fail(`llms.txt: /${h.slug}.md is ${linked ? '' : 'not '}linked`);
}

// --- /llms-full.txt
const full = read('llms-full.txt');
sameSet('llms-full.txt', eventUrls(full), wantUrls);
if (checkFreshness('llms-full.txt', full) !== upcoming.length) fail('llms-full.txt: wrong event count');
checkLinks('llms-full.txt', full);
checkHeadings('llms-full.txt', full);

// --- city and type lists
let longest = 0;
for (const h of HUBS) {
	const name = `${h.slug}.md`;
	if (!existsSync(new URL(name, dist))) {
		fail(`${name}: not built`);
		continue;
	}
	const text = read(name);
	const want = upcoming.filter((e) => h.matches(e)).map((e) => `${SITE}/events/${e.id}/`);
	sameSet(name, eventUrls(text), want);
	if (checkFreshness(name, text) !== want.length) fail(`${name}: wrong event count`);
	if (!text.includes(`Canonical: ${SITE}${h.path}\n`)) fail(`${name}: no Canonical line`);
	if (text.length > LIST_MAX) fail(`${name}: ${text.length} characters (max ${LIST_MAX})`);
	longest = Math.max(longest, text.length);
	checkLinks(name, text);
	checkHeadings(name, text);
	const html = read(`${h.slug}/index.html`);
	if (!html.includes(`<link rel="alternate" type="text/markdown" href="/${name}"`)) {
		fail(`/${h.slug}/: no <link rel="alternate"> to /${name}`);
	}
}

// --- sitemap: pages only
for (const f of readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f))) {
	const bad = read(f).match(/<loc>[^<]*(\.md|\.txt|\.json)<\/loc>/g);
	if (bad) fail(`${f}: lists ${bad.join(', ')}`);
}

console.log(
	`${upcoming.length} upcoming events; llms.txt ${llms.length} chars, llms-full.txt ${full.length} chars, ` +
		`${HUBS.length} city/type lists (longest ${longest} chars)`,
);
if (failures) {
	console.error(`${failures} problem(s).`);
	process.exit(1);
}
console.log('OK');
