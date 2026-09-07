import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import meta from '../data/meta.json';
import { SITE_URL, eventUrl, isFree, outboundUrl, today } from '../lib/events';

/* Machine-readable feed consumed by the n8n "social machine" running on
   Marcin's PC. It polls this file, diffs it against the ids it has already
   posted, and turns anything new into visuals + platform copy.

   Kept deliberately separate from the sitemap and from the page markup:
   the social pipeline should break loudly if the shape changes, not
   silently scrape HTML. `postKey` is the dedupe key — it changes when the
   date or venue changes, so a rescheduled event is announced again while a
   cosmetic blurb edit is not. */

function postKey(id: string, date: string, city: string): string {
	return `${id}::${date}::${city}`;
}

export const GET: APIRoute = async () => {
	const t = today();
	const entries = await getCollection('events');

	const events = entries
		.filter((e) => (e.data.endDate ?? e.data.date) >= t)
		.sort((a, b) => a.data.date.localeCompare(b.data.date))
		.map((e) => {
			const d = e.data;
			const daysUntil = Math.round(
				(Date.parse(d.date) - Date.parse(t)) / 86_400_000,
			);
			return {
				id: e.id,
				postKey: postKey(e.id, d.date, d.city),
				title: d.title,
				date: d.date,
				endDate: d.endDate ?? d.date,
				time: d.time ?? '',
				city: d.city,
				venue: d.venue ?? '',
				format: d.format,
				topics: d.topics,
				organiser: d.organiser,
				cost: d.cost,
				free: isFree(d.cost),
				blurb: d.blurb,
				firstSeen: d.firstSeen,
				daysUntil,
				listingUrl: eventUrl(e.id),
				registrationUrl: outboundUrl(d.url),
				source: d.source,
			};
		});

	return new Response(
		JSON.stringify(
			{
				site: SITE_URL,
				generatedAt: new Date().toISOString(),
				lastScan: meta.lastScan,
				count: events.length,
				events,
			},
			null,
			2,
		),
		{ headers: { 'Content-Type': 'application/json; charset=utf-8' } },
	);
};
