// Shows or sets where Buttondown sends people after they subscribe.
//
//   subscription_redirect_url              after the form is submitted  -> /subscribe/thanks/
//   subscription_confirmation_redirect_url after the confirmation link  -> /subscribe/confirmed/
//
// Without these, Buttondown shows its own page with a "View archives" button.
// These fields are only settable through the API, not the dashboard.
//
// Usage (PowerShell, key from Buttondown -> Settings -> API; never commit it):
//   $env:BUTTONDOWN_API_KEY = "..."
//   node scripts/buttondown-redirects.mjs           # show current values
//   node scripts/buttondown-redirects.mjs --apply   # set them

const API = 'https://api.buttondown.com/v1';
const SITE = 'https://swissdataevents.ch';
const WANTED = {
	subscription_redirect_url: `${SITE}/subscribe/thanks/`,
	subscription_confirmation_redirect_url: `${SITE}/subscribe/confirmed/`,
};

const key = process.env.BUTTONDOWN_API_KEY;
if (!key) {
	console.error('Set BUTTONDOWN_API_KEY first (Buttondown -> Settings -> API).');
	process.exit(1);
}
const headers = { Authorization: `Token ${key}`, 'Content-Type': 'application/json' };

async function call(method, path, body) {
	const res = await fetch(`${API}${path}`, { method, headers, body: body && JSON.stringify(body) });
	const text = await res.text();
	if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
	return text ? JSON.parse(text) : null;
}

function show(label, n) {
	console.log(`${label} (${n.username}):`);
	for (const k of Object.keys(WANTED)) console.log(`  ${k}: ${n[k] || '(not set)'}`);
}

const list = await call('GET', '/newsletters');
const newsletters = list.results ?? list;
const nl = newsletters.find((n) => n.username === 'swissdataevents') ?? newsletters[0];
if (!nl) throw new Error('No newsletter found for this API key.');
show('Current', nl);

if (process.argv.includes('--apply')) {
	const updated = await call('PATCH', `/newsletters/${nl.id}`, WANTED);
	show('Updated', updated);
} else {
	console.log('\nRun again with --apply to set:');
	for (const [k, v] of Object.entries(WANTED)) console.log(`  ${k}: ${v}`);
}
