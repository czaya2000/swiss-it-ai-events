import type { APIRoute, GetStaticPaths } from 'astro';
import { getUpcomingEvents } from '../../lib/events';
import { listFeeds, toIcsEvent, type Feed } from '../../lib/calendar-feeds';
import { buildCalendar } from '../../lib/ics';

/* Static calendar subscription feeds, regenerated on every build — so the
   Mon/Wed/Fri refresh keeps them current with no workflow changes. Same
   date window as the homepage (getUpcomingEvents). */

export const getStaticPaths = (async () => {
	const feeds = listFeeds(await getUpcomingEvents());
	return feeds.map((feed) => ({ params: { feed: feed.slug }, props: { feed } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ feed: Feed }> = ({ props }) => {
	const body = buildCalendar(props.feed.name, props.feed.events.map(toIcsEvent));
	return new Response(body, {
		headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
	});
};
