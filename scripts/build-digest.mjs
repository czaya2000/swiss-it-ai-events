// Builds the weekly digest and saves it in Buttondown as a DRAFT.
//
// One email goes to every subscriber. Each event sits inside a Buttondown
// (Django) template condition, so each reader only sees events whose city AND
// format match their tags. An empty choice means "all" (see src/lib/newsletter.mjs).
// Each event is rendered once, so overlapping tags can never repeat it.
//
//   node scripts/build-digest.mjs --dry-run   # print subject + body, call nothing
//   BUTTONDOWN_API_KEY=... node scripts/build-digest.mjs   # create the draft
//
// Options:
//   --dry-run       print, don't call the API
//   --days=N        "new" means firstSeen within the last N days (default 7)
//   --ahead=N       the first section covers the next N days (default 14)
//   --today=YYYY-MM-DD   pretend today is this date (for testing)
//   --replace       if this week's email is still a draft, overwrite its body
//
// Safe to re-run: if an email with this week's subject already exists in
// Buttondown, it stops without creating another one.

import { readFileSync } from 'node:fs';
import {
	NEWSLETTER_CITIES,
	NEWSLETTER_FORMATS,
	newsletterCity,
	cityTag,
	formatTag,
} from '../src/lib/newsletter.mjs';

const SITE_URL = 'https://swissdataevents.ch';
const API = 'https://api.buttondown.com/v1';

const args = Object.fromEntries(
	process.argv.slice(2).map((a) => {
		const [k, v] = a.replace(/^--/, '').split('=');
		return [k, v ?? true];
	}),
);
const dryRun = Boolean(args['dry-run']);
const days = Number(args.days ?? 7);
const ahead = Number(args.ahead ?? 14);
const today = args.today ?? new Date().toISOString().slice(0, 10);

const addDays = (iso, n) => {
	const d = new Date(`${iso}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
};

function isoWeek(iso) {
	const d = new Date(`${iso}T00:00:00Z`);
	const day = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - day);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return { week: Math.ceil(((d - yearStart) / 86400000 + 1) / 7), year: d.getUTCFullYear() };
}

// ---- Pick the events --------------------------------------------------------

// Two sections, each filtered per reader:
//   1. "Next two weeks": everything on (or still running) in the next `ahead` days.
//   2. "New this week": first seen in the last `days` days, later than section 1.
// An event never shows twice: new events inside the two weeks stay in section 1
// and get the site's red "new" dot there.
const since = addDays(today, -days); // exclusive
const horizon = addDays(today, ahead - 1); // inclusive
const upcoming = JSON.parse(readFileSync('src/data/events.json', 'utf8'))
	.filter((e) => (e.endDate ?? e.date) >= today)
	.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
const isNew = (e) => e.firstSeen > since && e.firstSeen <= today;
// Already running counts only for short events (a conference's last day), not
// long series that started weeks ago.
const startsSoon = (e) => e.date >= today || addDays(e.date, 7) >= (e.endDate ?? e.date);
const soon = upcoming.filter((e) => e.date <= horizon && startsSoon(e));
const fresh = upcoming.filter((e) => e.date > horizon && isNew(e));

if (soon.length === 0 && fresh.length === 0) {
	console.log(`Nothing in the next ${ahead} days and nothing new since ${since}. No digest this week.`);
	process.exit(0);
}

// ---- Template conditions ----------------------------------------------------
// Django's {% if %} has no parentheses, but `and` binds tighter than `or`, so
//   'city-x' in tags or 'city-a' not in tags and 'city-b' not in tags ...
// reads as "city x chosen, or no city chosen". Each event gets one such check
// for its city, nested around one for its format: nesting gives the AND.

const has = (tag) => `'${tag}' in subscriber.tags`;
const lacks = (tag) => `'${tag}' not in subscriber.tags`;
const NO_CITY = NEWSLETTER_CITIES.map((c) => lacks(cityTag(c.slug))).join(' and ');
const NO_FORMAT = NEWSLETTER_FORMATS.map((f) => lacks(formatTag(f.label))).join(' and ');

const cityCheck = (city) => `${has(cityTag(city))} or ${NO_CITY}`;
const formatCheck = (format) => `${has(formatTag(format))} or ${NO_FORMAT}`;

/** Wraps text so it only shows for matching readers. Null city = everyone. */
function wrap(event, text) {
	const city = newsletterCity(event.city);
	const inner = `{% if ${formatCheck(event.format)} %}\n${text}\n{% endif %}`;
	return city ? `{% if ${cityCheck(city)} %}\n${inner}\n{% endif %}` : inner;
}

// "Did anything match this reader?" as one OR of AND-groups, used only for the
// fallback line. Bounded by the distinct cities and formats in the section.
function anyMatchCondition(events) {
	const groups = new Set();
	for (const e of events) {
		const city = newsletterCity(e.city);
		const fmt = formatTag(e.format);
		const cityOpts = city ? [has(cityTag(city)), NO_CITY] : [null];
		for (const c of cityOpts) {
			for (const f of [has(fmt), NO_FORMAT]) groups.add([c, f].filter(Boolean).join(' and '));
		}
	}
	return [...groups].join(' or ');
}

// ---- Render -----------------------------------------------------------------

// Raw HTML with inline styles, so it looks like the website in every mail app
// (Gmail ignores most <style> rules). Same tokens as src/styles/theme.css:
// Archivo, black on warm off-white, one red accent rule, square corners.
// Mail apps that can't load Archivo fall back to Helvetica/Arial, as the site does.

const T = {
	bg: '#fbfbf9',
	ink: '#000000',
	ink2: '#3f3f45',
	muted: '#6b6b70',
	border: '#dededa',
	accent: '#e30613',
	font: "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif",
};
const UTM = 'utm_source=newsletter&utm_medium=email&utm_campaign=digest';
const HOME = `${SITE_URL}/?${UTM}`;
const esc = (s) =>
	String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const link = (e) => `${SITE_URL}/events/${e.id}/?${UTM}`;

const datePart = (iso, opts) =>
	new Intl.DateTimeFormat('en-GB', { ...opts, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
const spine = (iso) => ({
	day: datePart(iso, { day: 'numeric' }),
	weekday: datePart(iso, { weekday: 'short' }),
	month: datePart(iso, { month: 'short' }),
});

// One homepage row: the date spine on the left, then title, place, blurb and
// the format / cost labels (the site's mobile layout, which suits a 600px email).
function renderEvent(e, { dot = false } = {}) {
	const s = spine(e.date);
	const newDot = dot
		? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${T.accent};vertical-align:middle;margin:0 8px 3px 0;"></span>`
		: '';
	const end = e.endDate && e.endDate !== e.date ? spine(e.endDate) : null;
	const through = end
		? `<div style="font-size:12px;color:${T.muted};white-space:nowrap;">to ${end.day} ${end.month}</div>`
		: '';
	const free = /\bfree\b/i.test(e.cost);
	const cost = /not listed/i.test(e.cost)
		? ''
		: `<span style="color:${free ? T.ink : T.muted};${free ? 'font-weight:600;' : ''}">${esc(e.cost)}</span>`;
	const format = `<span style="border:1px solid ${T.border};padding:2px 8px;color:${T.ink2};">${esc(e.format)}</span>`;
	const meta = [e.city, e.venue, e.time].filter(Boolean).map(esc).join(', ');
	return `<tr>
<td valign="top" width="64" style="width:64px;padding:18px 16px 18px 0;border-bottom:1px solid ${T.border};font-family:${T.font};">
<div style="font-size:28px;font-weight:600;line-height:1;color:${T.ink};">${s.day}</div>
<div style="font-size:12px;color:${T.muted};margin-top:5px;white-space:nowrap;">${s.weekday}, ${s.month}</div>${through}
</td>
<td valign="top" style="padding:18px 0;border-bottom:1px solid ${T.border};font-family:${T.font};">
${newDot}<a href="${link(e)}" style="font-size:18px;font-weight:500;line-height:1.28;letter-spacing:-0.01em;color:${T.ink};text-decoration:none;">${esc(e.title)}</a>
<div style="font-size:14px;color:${T.ink2};margin-top:6px;line-height:1.5;">${meta}</div>
<div style="font-size:13px;color:${T.muted};margin-top:3px;line-height:1.5;">${esc(e.blurb)}</div>
<div style="font-size:13px;margin-top:10px;line-height:1.5;">${[format, cost].filter(Boolean).join('&nbsp;&nbsp;')}</div>
</td>
</tr>`;
}

const { week, year } = isoWeek(today);
const subject = `Swiss data & AI events · week ${week}, ${year}`;

const a = (href, text, color = T.ink) => `<a href="${href}" style="color:${color};text-decoration:underline;">${text}</a>`;
const p = (html, style = '') =>
	`<p style="margin:0;font-family:${T.font};font-size:15px;line-height:1.5;color:${T.ink};${style}">${html}</p>`;

// The site's masthead: the mark (a frame with the accent band on top), the
// name, then the 3px accent rule. Built from table cells because Gmail drops SVG.
const masthead = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr><td style="padding:24px 0 18px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:11px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="18" style="border:2px solid ${T.ink};"><tr><td height="4" style="height:4px;line-height:4px;font-size:0;background:${T.accent};">&nbsp;</td></tr><tr><td height="10" style="height:10px;line-height:10px;font-size:0;">&nbsp;</td></tr></table></td>
<td valign="middle" style="font-family:${T.font};font-size:19px;font-weight:700;letter-spacing:-0.015em;"><a href="${HOME}" style="color:${T.ink};text-decoration:none;">Swiss Data Events</a></td>
</tr></table>
</td></tr>
<tr><td height="3" style="height:3px;line-height:3px;font-size:0;background:${T.accent};">&nbsp;</td></tr>
</table>`;

const intro = `<div style="padding:28px 0 4px;">
${p('Data and AI events in Switzerland, picked for your cities and event types.', `color:${T.ink2};`)}
</div>`;

// A section: heading, short note, then the rows. Each row is wrapped in its
// reader condition; the fallback line shows when none of them match.
function section(title, note, events, empty, opts = {}) {
	const head = `<div style="padding:28px 0 14px;">
<h2 style="margin:0 0 6px;font-family:${T.font};font-size:26px;font-weight:600;line-height:1.15;letter-spacing:-0.02em;color:${T.ink};">${title}</h2>
${p(note, `font-size:14px;color:${T.muted};`)}
</div>`;
	const fallback = `<tr><td colspan="2" style="padding:18px 0;border-bottom:1px solid ${T.border};">${p(empty, `color:${T.ink2};`)}</td></tr>`;
	const list = events.map((e) => wrap(e, renderEvent(e, opts.dot ? { dot: isNew(e) } : {}))).join('\n');
	const any = anyMatchCondition(events);
	const rows = events.length === 0 ? fallback : `{% if ${any} %}\n${list}\n{% else %}\n${fallback}\n{% endif %}`;
	return `${head}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${T.ink};">
${rows}
</table>`;
}

const sections = [
	section(
		'Next two weeks',
		`${datePart(today, { day: 'numeric', month: 'short' })} – ${datePart(horizon, { day: 'numeric', month: 'short' })}. <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${T.accent};vertical-align:middle;margin:0 2px 2px 4px;"></span> new this week.`,
		soon,
		'Nothing in your cities and event types in the next two weeks.',
		{ dot: true },
	),
	section(
		'New this week',
		'Added since last Monday, happening after the next two weeks.',
		fresh,
		'Nothing new for your cities and event types this week.',
	),
].join('\n');

const outro = `<div style="padding:28px 0 8px;">
${p(a(HOME, 'See all upcoming events'), 'font-weight:500;')}
${p(a('{{ manage_subscription_url }}', 'Change your cities and event types', T.muted), `margin-top:10px;font-size:13px;color:${T.muted};`)}
</div>`;

// The marker keeps the draft in Buttondown's plain (markdown) editor, which
// passes raw HTML through. Its visual editor drops unsupported attributes.
const body = `<!-- buttondown-editor-mode: plaintext -->
<div style="background:${T.bg};padding:0 20px 24px;">
<div style="max-width:600px;margin:0 auto;font-family:${T.font};color:${T.ink};">
${masthead}
${intro}
${sections}
${outro}
</div>
</div>`;

console.log(`Subject: ${subject}`);
const show = (e) =>
	console.log(`  - ${e.date} ${e.city} → ${newsletterCity(e.city) ?? 'everyone'} | ${e.format} | ${e.title}${isNew(e) ? ' (new)' : ''}`);
console.log(`Next two weeks (${today} to ${horizon}): ${soon.length}`);
soon.forEach(show);
console.log(`New this week, later (firstSeen after ${since}): ${fresh.length}`);
fresh.forEach(show);

if (dryRun) {
	console.log('\n----- body -----\n' + body);
	process.exit(0);
}

// ---- Create the draft -------------------------------------------------------

const key = process.env.BUTTONDOWN_API_KEY;
if (!key) {
	console.log('BUTTONDOWN_API_KEY is not set. Skipping (no draft created).');
	process.exit(0);
}
const headers = { Authorization: `Token ${key}`, 'Content-Type': 'application/json' };

const existing = await fetch(`${API}/emails?subject=${encodeURIComponent(subject)}`, { headers });
if (!existing.ok) {
	console.error(`Could not check for an existing digest: HTTP ${existing.status} ${await existing.text()}`);
	process.exit(1);
}
const found = await existing.json();
const same = (found.results ?? []).filter((e) => e.subject === subject);

// archival_mode disabled: the public archive page has no subscriber, so the
// conditions would show it an empty email. The site itself is the archive.
// template classic: the plainest layout on our plan, so the body's own
// masthead is the only one ("modern" adds a second one with the logo).
const payload = { subject, body, archival_mode: 'disabled', template: 'classic' };

if (same.length > 0) {
	const draft = same.find((e) => e.status === 'draft');
	if (!args.replace || !draft) {
		console.log(
			draft
				? `A draft with this subject already exists. Run with --replace to update it.`
				: `A digest with this subject was already sent or scheduled. Not creating another.`,
		);
		process.exit(0);
	}
	const upd = await fetch(`${API}/emails/${draft.id}`, { method: 'PATCH', headers, body: JSON.stringify(payload) });
	if (!upd.ok) {
		console.error(`Buttondown refused the update: HTTP ${upd.status} ${await upd.text()}`);
		process.exit(1);
	}
	console.log(`Draft updated in Buttondown (id ${draft.id}). Review and send it from the dashboard.`);
	process.exit(0);
}

const res = await fetch(`${API}/emails`, {
	method: 'POST',
	headers,
	body: JSON.stringify({ ...payload, status: 'draft' }),
});
if (!res.ok) {
	console.error(`Buttondown refused the draft: HTTP ${res.status} ${await res.text()}`);
	process.exit(1);
}
const email = await res.json();
console.log(`Draft created in Buttondown (id ${email.id}). Review and send it from the dashboard.`);
