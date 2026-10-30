// The weekly digest (Buttondown, newsletter "swissdataevents").
//
// Subscribers pick cities and event types on the signup form. Each choice is a
// Buttondown tag: `city-<slug>` and `format-<slug>`. The digest shows an event
// when its city AND its format match. Picking no city means every city, and
// picking no format means every format.
//
// This is a fixed list on purpose: Buttondown tags must stay stable, so smaller
// places go to the nearest big city here. The homepage filter and calendar feeds
// keep their own grouping (cityGroup in events.ts) and are not affected.
//
// Plain .mjs so both Astro and the Node scripts (validator, digest) can import it.

export const BUTTONDOWN_USERNAME = 'swissdataevents';
export const SUBSCRIBE_ACTION = `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`;

export const NEWSLETTER_CITIES = [
	{ slug: 'zurich', label: 'Zurich' },
	{ slug: 'geneva', label: 'Geneva' },
	{ slug: 'lausanne', label: 'Lausanne' },
	{ slug: 'basel', label: 'Basel' },
	{ slug: 'bern', label: 'Bern' },
	{ slug: 'lucerne', label: 'Lucerne' },
	{ slug: 'lugano', label: 'Lugano' },
	{ slug: 'neuchatel', label: 'Neuchâtel' },
	{ slug: 'online', label: 'Online' },
];

export const NEWSLETTER_FORMATS = [
	{ slug: 'meetup', label: 'Meetup' },
	{ slug: 'conference', label: 'Conference' },
	{ slug: 'workshop', label: 'Workshop' },
	{ slug: 'networking', label: 'Networking' },
	{ slug: 'webinar', label: 'Webinar' },
];

/** Place slug → newsletter city slug. Decided with Marcin, 2026-10-28. */
const PLACE_TO_CITY = {
	// Zurich
	zurich: 'zurich',
	'zurich-flughafen': 'zurich',
	oerlikon: 'zurich',
	opfikon: 'zurich',
	schlieren: 'zurich',
	fahrweid: 'zurich',
	dietlikon: 'zurich',
	dubendorf: 'zurich',
	winterthur: 'zurich',
	'rapperswil-jona': 'zurich',
	'neuhausen-am-rheinfall': 'zurich',
	zug: 'zurich',
	chur: 'zurich',
	davos: 'zurich',
	// Geneva
	geneva: 'geneva',
	versoix: 'geneva',
	lancy: 'geneva',
	'le-grand-saconnex': 'geneva',
	thonex: 'geneva',
	gland: 'geneva',
	// Lausanne
	lausanne: 'lausanne',
	prilly: 'lausanne',
	'saint-sulpice': 'lausanne',
	'yverdon-les-bains': 'lausanne',
	martigny: 'lausanne',
	sierre: 'lausanne',
	// Bern
	bern: 'bern',
	liebefeld: 'bern',
	fribourg: 'bern',
	// Neuchâtel
	neuchatel: 'neuchatel',
	'la-chaux-de-fonds': 'neuchatel',
	// Lucerne
	lucerne: 'lucerne',
	rotkreuz: 'lucerne',
	immensee: 'lucerne',
	// Lugano
	lugano: 'lugano',
	bioggio: 'lugano',
	// Basel
	basel: 'basel',
};

function slug(s) {
	return s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Newsletter city slug for an event's `city` field.
 * Returns null when the event should go to every subscriber: "Nationwide",
 * or a place not in the mapping yet (the validator warns about those).
 * "Rotkreuz (Zug)" checks "Rotkreuz" first, then "Zug".
 */
export function newsletterCity(city) {
	const text = city.trim();
	if (/^online\b/i.test(text)) return 'online';
	if (/^nationwide\b/i.test(text)) return null;
	const bracket = text.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
	const candidates = bracket ? [bracket[1], bracket[2]] : [text];
	for (const place of candidates) {
		const hit = PLACE_TO_CITY[slug(place)];
		if (hit) return hit;
	}
	return null;
}

/** True when a place is deliberately sent to everyone, rather than unmapped. */
export function isNationwide(city) {
	return /^nationwide\b/i.test(city.trim());
}

export const cityTag = (citySlug) => `city-${citySlug}`;
export const formatTag = (format) => `format-${slug(format)}`;
