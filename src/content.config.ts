import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const events = defineCollection({
	loader: file('src/data/events.json'),
	schema: z.object({
		title: z.string(),
		date: z.string(),
		endDate: z.string().optional(),
		time: z.string().optional(),
		city: z.string(),
		venue: z.string().optional(),
		format: z.enum(['Meetup', 'Conference', 'Workshop', 'Networking', 'Webinar']),
		topics: z.array(z.string()),
		organiser: z.string(),
		cost: z.string(),
		url: z.string().url(),
		source: z.string(),
		blurb: z.string(),
		firstSeen: z.string(),
	}),
});

export const collections = { events };
