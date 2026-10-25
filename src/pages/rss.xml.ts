import type { APIRoute } from 'astro';
import { SITE_NAME, SITE_URL, getUpcomingEvents } from '../lib/events';
import { SITE_SCOPE, publicEvent } from '../lib/public-data';

/* RSS 2.0 of upcoming events, newest listings first (by firstSeen), so a
   feed reader or agent sees what was just added. Hand-written: it is a few
   lines and avoids another dependency. */

const esc = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
	const events = (await getUpcomingEvents())
		.map(publicEvent)
		.sort((a, b) => b.firstSeen.localeCompare(a.firstSeen) || a.start.localeCompare(b.start));

	const items = events.map((e) => {
		const where = e.online ? 'Online' : [e.venue, e.city].filter(Boolean).join(', ');
		const summary = `${e.dateLabel}${e.time ? `, ${e.time}` : ''} · ${where} · ${e.format} · ${e.cost}. ${e.description} Organiser: ${e.organiser}.`;
		return [
			'    <item>',
			`      <title>${esc(`${e.title} (${e.dateLabel}, ${e.city})`)}</title>`,
			`      <link>${e.url}</link>`,
			`      <guid isPermaLink="true">${e.url}</guid>`,
			`      <pubDate>${new Date(`${e.firstSeen}T06:00:00Z`).toUTCString()}</pubDate>`,
			`      <description>${esc(summary)}</description>`,
			`      <category>${esc(e.format)}</category>`,
			...e.topics.map((t) => `      <category>${esc(t)}</category>`),
			'    </item>',
		].join('\n');
	});

	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
		'  <channel>',
		`    <title>${esc(SITE_NAME)}: upcoming IT, data and AI events in Switzerland</title>`,
		`    <link>${SITE_URL}/</link>`,
		`    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
		`    <description>${esc(SITE_SCOPE)}</description>`,
		'    <language>en</language>',
		`    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
		'    <ttl>720</ttl>',
		...items,
		'  </channel>',
		'</rss>',
		'',
	].join('\n');

	return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
