// Hub pages: one indexable listing per city (/geneva/) and per event type
// (/conferences/), built by src/pages/[hub]/index.astro from the same
// component as the homepage (src/components/Listing.astro).
//
// Every hub always has a page, so a link never 404s. A hub with fewer than
// HUB_MIN_EVENTS upcoming events is "thin": its page is noindex, it is left
// out of the sitemap, and nothing links to it. It comes back on its own when
// the count recovers.
//
// Cities are the newsletter's nine (newsletter.mjs), so a hub, the City
// filter, the calendar feed and the digest tag all mean the same set of events.
//
// Plain .mjs so astro.config.mjs can import it for the sitemap.

import {
	NEWSLETTER_CITIES,
	NEWSLETTER_FORMATS,
	newsletterCity,
	cityTag,
	formatTag,
} from './newsletter.mjs';

export const HUB_MIN_EVENTS = 5;

// `nearby` lists the smaller places that newsletter.mjs folds into the city,
// so the page says what it covers. Keep it in step with PLACE_TO_CITY.
const CITY_COPY = {
	zurich: { nearby: 'Winterthur, Zug, St. Gallen and Davos' },
	geneva: { nearby: 'Carouge, Versoix, Lancy and Gland' },
	lausanne: { nearby: 'Prilly, Yverdon-les-Bains and the Valais (Sion, Sierre, Martigny)' },
	basel: {},
	bern: { nearby: 'Liebefeld and Fribourg' },
	lucerne: { nearby: 'Rotkreuz and Immensee' },
	lugano: { nearby: 'Bioggio' },
	neuchatel: { nearby: 'La Chaux-de-Fonds' },
	online: {},
};

// URL slug and wording per event type. `one` / `many` are used in sentences.
const FORMAT_COPY = {
	Meetup: { slug: 'meetups', plural: 'Meetups', one: 'meetup', many: 'meetups' },
	Conference: { slug: 'conferences', plural: 'Conferences', one: 'conference', many: 'conferences' },
	Workshop: { slug: 'workshops', plural: 'Workshops', one: 'workshop', many: 'workshops' },
	Networking: {
		slug: 'networking',
		plural: 'Networking Events',
		one: 'networking event',
		many: 'networking events',
	},
	Webinar: { slug: 'webinars', plural: 'Webinars', one: 'webinar', many: 'webinars' },
};

const cityHubs = NEWSLETTER_CITIES.map((c) => {
	const online = c.slug === 'online';
	return {
		kind: 'city',
		slug: c.slug,
		path: `/${c.slug}/`,
		label: c.label,
		linkLabel: c.label,
		h1: online ? 'Online AI & Data Events in Switzerland' : `AI & Data Events in ${c.label}`,
		where: online ? 'online' : `in ${c.label}`,
		nearby: CITY_COPY[c.slug]?.nearby ?? '',
		one: 'event',
		many: 'events',
		// Pre-ticked in the digest dialog, and pre-chosen in "Save to my calendar".
		tag: cityTag(c.slug),
		calCity: online ? 'online-ch' : c.slug,
		calFormat: '',
		matches: (e) => newsletterCity(e.city) === c.slug,
	};
});

const formatHubs = NEWSLETTER_FORMATS.map((f) => {
	const copy = FORMAT_COPY[f.label];
	return {
		kind: 'format',
		slug: copy.slug,
		path: `/${copy.slug}/`,
		label: f.label,
		linkLabel: copy.plural === 'Networking Events' ? 'Networking' : copy.plural,
		h1: `AI & Data ${copy.plural} in Switzerland`,
		where: 'across Switzerland',
		nearby: '',
		one: copy.one,
		many: copy.many,
		tag: formatTag(f.label),
		calCity: '',
		calFormat: f.slug,
		matches: (e) => e.format === f.label,
	};
});

export const HUBS = [...cityHubs, ...formatHubs];

/** Number of the given events (plain objects with `city` and `format`) on a hub. */
export function hubCount(hub, events) {
	return events.filter((e) => hub.matches(e)).length;
}

/** True when the hub has enough upcoming events to be indexed and linked to. */
export function isHubLive(hub, events) {
	return hubCount(hub, events) >= HUB_MIN_EVENTS;
}

/** The city hub an event belongs to, or undefined ("Nationwide", unmapped place). */
export function cityHubFor(event) {
	return cityHubs.find((h) => h.matches(event));
}
