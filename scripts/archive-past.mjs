// Moves ended events from src/data/events.json to src/data/archive.json.
//
// An event is moved once its endDate (or date) is more than GRACE_DAYS in the
// past. Archived events keep their page at /events/<id>/ (marked "ended",
// noindex) so old links from search, social posts and calendars still land
// somewhere useful, but they never appear in listings, feeds or the sitemap.
//
// Deterministic on purpose: the refresh agent used to delete past entries
// itself; now it leaves them and the workflow runs this step instead.
//
//   node scripts/archive-past.mjs            (npm run archive)
//   node scripts/archive-past.mjs --dry-run

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const EVENTS_PATH = 'src/data/events.json';
const ARCHIVE_PATH = 'src/data/archive.json';
const GRACE_DAYS = 3;
const dryRun = process.argv.includes('--dry-run');

const events = JSON.parse(readFileSync(EVENTS_PATH, 'utf8'));
const archive = existsSync(ARCHIVE_PATH) ? JSON.parse(readFileSync(ARCHIVE_PATH, 'utf8')) : [];

const cutoff = new Date();
cutoff.setUTCDate(cutoff.getUTCDate() - GRACE_DAYS);
const cutoffIso = cutoff.toISOString().slice(0, 10);

const ended = (e) => (e.endDate ?? e.date) < cutoffIso;
const moving = events.filter(ended);
const keeping = events.filter((e) => !ended(e));

if (moving.length === 0) {
	console.log(`Nothing to archive (cutoff ${cutoffIso}).`);
	process.exit(0);
}

// The latest copy of an event wins, so a re-listed-then-ended event is not duplicated.
const byId = new Map(archive.map((e) => [e.id, e]));
for (const e of moving) byId.set(e.id, e);
const nextArchive = [...byId.values()].sort(
	(a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
);

for (const e of moving) console.log(`  archive  ${e.date}  ${e.id}`);
console.log(`${moving.length} moved to ${ARCHIVE_PATH} (cutoff ${cutoffIso}); ${keeping.length} remain.`);

if (!dryRun) {
	writeFileSync(EVENTS_PATH, JSON.stringify(keeping, null, 2) + '\n');
	writeFileSync(ARCHIVE_PATH, JSON.stringify(nextArchive, null, 2) + '\n');
}
