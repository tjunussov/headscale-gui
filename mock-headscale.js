#!/usr/bin/env node
// Mock Headscale REST API (v0.26 shapes) for UI work without a real server.
// In-memory, resets on restart. Any non-empty Bearer token is accepted.
//
//   node mock-headscale.js                 # :8081  (PORT, MOCK_DELAY=ms, MOCK_FLAP=1 env)
//   npm run dev:mock                       # mock + vite with /api proxy → open http://localhost:5173
//   node mock-headscale.js --selftest      # quick assertion run
import http from 'node:http';
import { randomBytes } from 'node:crypto';

const PORT = +(process.env.PORT ?? 8081);
const DELAY = +(process.env.MOCK_DELAY ?? 0);
const FLAP = process.env.MOCK_FLAP === '1'; // randomly toggle node online state

const now = () => new Date().toISOString();
const ago = (min) => new Date(Date.now() - min * 6e4).toISOString();
const inDays = (d) => new Date(Date.now() + d * 864e5).toISOString();
const ZERO = '0001-01-01T00:00:00Z';
const hex = (n) => randomBytes(n).toString('hex');

// ── seed ───────────────────────────────────────────────────────────
let seq = { user: 0, node: 0, pak: 0, key: 0 };
const db = { users: [], nodes: [], paks: [], apiKeys: [], policy: '' };

const mkUser = (name, extra = {}) => {
	const u = { id: String(++seq.user), name, createdAt: ago(60 * 24 * 30), displayName: '', email: '', providerId: '', provider: '', profilePicUrl: '', ...extra };
	db.users.push(u);
	return u;
};
const mkNode = (givenName, user, o = {}) => {
	const id = ++seq.node;
	const n = {
		id: String(id), machineKey: 'mkey:' + hex(32), nodeKey: 'nodekey:' + hex(32), discoKey: 'discokey:' + hex(32),
		ipAddresses: [`100.64.0.${id}`, `fd7a:115c:a1e0::${id}`], name: o.hostname ?? givenName, user,
		lastSeen: o.online ? now() : (o.lastSeen ?? ago(60 * 26)), expiry: o.expiry ?? ZERO, preAuthKey: null,
		createdAt: ago(60 * 24 * (20 - id)), registerMethod: o.method ?? 'REGISTER_METHOD_AUTH_KEY',
		tags: o.tags ?? [],
		givenName, online: !!o.online, approvedRoutes: o.approved ?? [], availableRoutes: o.routes ?? [], subnetRoutes: [],
	};
	n.subnetRoutes = n.approvedRoutes.filter((r) => n.availableRoutes.includes(r));
	db.nodes.push(n);
	return n;
};
const mkPak = (user, o = {}) => {
	const p = { user, id: String(++seq.pak), key: 'hskey-auth-' + hex(24), reusable: !!o.reusable, ephemeral: !!o.ephemeral, used: !!o.used, expiration: o.expiration ?? inDays(1), createdAt: now(), aclTags: [] };
	db.paks.push(p);
	return p;
};
const mkApiKey = (prefix, expiration = inDays(90)) => {
	const k = { id: String(++seq.key), prefix, expiration, createdAt: now(), lastSeen: null };
	db.apiKeys.push(k);
	return k;
};

function seed() {
	const timur = mkUser('timur');
	const alice = mkUser('alice', { displayName: 'Alice Smith', email: 'alice@example.com', provider: 'oidc', providerId: 'https://sso.example.com/1' });
	const ops = mkUser('ops');
	mkUser('guest');
	mkNode('laptop-mbp', timur, { online: true, method: 'REGISTER_METHOD_OIDC' });
	mkNode('nas', timur, { online: true, tags: ['tag:storage'], routes: ['192.168.1.0/24'], approved: ['192.168.1.0/24'] });
	mkNode('phone', alice, { lastSeen: ago(12), expiry: inDays(5) });
	mkNode('ipad', alice, { lastSeen: ago(60 * 24 * 9), expiry: ago(60) });
	mkNode('router-gw', ops, { online: true, tags: ['tag:router'], routes: ['10.0.0.0/8', '172.16.0.0/12'], approved: ['10.0.0.0/8'] });
	mkNode('exit-ams', ops, { online: true, tags: ['tag:exit'], routes: ['0.0.0.0/0', '::/0'] });
	mkNode('vps-fra', ops, { lastSeen: ZERO, method: 'REGISTER_METHOD_CLI' });
	mkPak(timur, { reusable: true });
	mkPak(timur, { used: true });
	mkPak(ops, { ephemeral: true, expiration: inDays(7) });
	mkPak(alice, { expiration: ago(5) });
	db.policy = JSON.stringify(
		{
			groups: { 'group:admins': ['timur', 'alice@example.com'] },
			tagOwners: { 'tag:router': ['group:admins'], 'tag:exit': ['group:admins'], 'tag:storage': ['timur'] },
			hosts: { 'office-lan': '192.168.1.0/24' },
			acls: [
				{ action: 'accept', src: ['group:admins'], dst: ['*:*'] },
				{ action: 'accept', src: ['alice@example.com'], dst: ['tag:storage:445,22', 'office-lan:*'] },
			],
			ssh: [{ action: 'accept', src: ['group:admins'], dst: ['tag:router'], users: ['root'] }],
		},
		null,
		4,
	);
}
seed();

// ── http helpers ───────────────────────────────────────────────────
class HttpError extends Error {
	constructor(status, message, code = 2) { super(message); this.status = status; this.code = code; }
}
const fail = (message, status = 400) => { throw new HttpError(status, message); };
const must = (x, what) => x ?? fail(`${what} not found`, 404);
const user = (id) => must(db.users.find((u) => u.id === String(id) || u.name === id), 'user');
const node = (id) => must(db.nodes.find((n) => n.id === String(id)), 'node');
const body = (req) => new Promise((ok) => { let s = ''; req.on('data', (c) => (s += c)); req.on('end', () => { try { ok(s ? JSON.parse(s) : {}); } catch { ok({}); } }); });
const refreshNode = (n) => { n.subnetRoutes = n.approvedRoutes.filter((r) => n.availableRoutes.includes(r)); if (n.online) n.lastSeen = now(); return n; };

// ── routes: [method, regex, handler(match, query, body, token)] ────
const routes = [
	['GET', /^\/user$/, (m, q) => ({ users: q.get('name') ? db.users.filter((u) => u.name === q.get('name')) : db.users })],
	['POST', /^\/user$/, (m, q, b) => {
		if (!b.name) fail('name is required');
		if (db.users.some((u) => u.name === b.name)) fail('user already exists');
		return { user: mkUser(b.name, { createdAt: now() }) };
	}],
	['DELETE', /^\/user\/(\d+)$/, ([, id]) => {
		const u = user(id);
		if (db.nodes.some((n) => n.user.id === u.id)) fail('user still has nodes', 500);
		db.users = db.users.filter((x) => x !== u);
		db.paks = db.paks.filter((p) => p.user.id !== u.id);
		return {};
	}],
	['POST', /^\/user\/(\d+)\/rename\/(.+)$/, ([, id, name]) => {
		const u = user(id);
		if (db.users.some((x) => x.name === name && x !== u)) fail('user already exists');
		u.name = decodeURIComponent(name);
		return { user: u };
	}],

	['GET', /^\/node$/, () => ({ nodes: db.nodes.map(refreshNode) })],
	['POST', /^\/node\/register$/, (m, q) => {
		const u = user(must(q.get('user'), 'user'));
		if (!q.get('key')) fail('key is required');
		return { node: mkNode('new-node-' + (seq.node + 1), u, { online: true, method: 'REGISTER_METHOD_CLI' }) };
	}],
	['DELETE', /^\/node\/(\d+)$/, ([, id]) => { const n = node(id); db.nodes = db.nodes.filter((x) => x !== n); return {}; }],
	['POST', /^\/node\/(\d+)\/rename\/(.+)$/, ([, id, name]) => { const n = node(id); n.givenName = decodeURIComponent(name); return { node: n }; }],
	['POST', /^\/node\/(\d+)\/user$/, ([, id], q, b) => { const n = node(id); n.user = user(b.user); return { node: n }; }],
	['POST', /^\/node\/(\d+)\/expire$/, ([, id]) => { const n = node(id); n.expiry = now(); n.online = false; return { node: n }; }],
	['POST', /^\/node\/(\d+)\/tags$/, ([, id], q, b) => {
		const n = node(id);
		const tags = b.tags ?? [];
		if (tags.some((t) => !/^tag:[a-z0-9-_]+$/.test(t))) fail('tags must start with "tag:" and be lowercase alphanumeric');
		n.tags = tags;
		return { node: n };
	}],
	['POST', /^\/node\/(\d+)\/approve_routes$/, ([, id], q, b) => {
		const n = node(id);
		n.approvedRoutes = (b.routes ?? []).filter((r) => n.availableRoutes.includes(r));
		return { node: refreshNode(n) };
	}],

	['GET', /^\/health$/, () => ({ databaseConnectivity: true })],
	// 0.28: no ?user lists every key; DELETE ?id= removes one
	['GET', /^\/preauthkey$/, (m, q) => ({ preAuthKeys: q.get('user') ? db.paks.filter((p) => p.user.id === user(q.get('user')).id) : db.paks })],
	['DELETE', /^\/preauthkey$/, (m, q) => { must(db.paks.find((p) => p.id === q.get('id')), 'preauthkey'); db.paks = db.paks.filter((p) => p.id !== q.get('id')); return {}; }],
	['POST', /^\/preauthkey$/, (m, q, b) => ({ preAuthKey: mkPak(user(b.user), b) })],
	['POST', /^\/preauthkey\/expire$/, (m, q, b) => { must(db.paks.find((p) => p.key === b.key), 'preauthkey').expiration = now(); return {}; }],

	['GET', /^\/apikey$/, () => ({ apiKeys: db.apiKeys })],
	['POST', /^\/apikey$/, (m, q, b) => { const k = hex(4).slice(0, 7) + '.' + hex(16); mkApiKey(k.split('.')[0], b.expiration); return { apiKey: k }; }],
	['POST', /^\/apikey\/expire$/, (m, q, b) => { const k = db.apiKeys.find((x) => b.prefix?.startsWith(x.prefix)); if (k) k.expiration = now(); return {}; }],

	['GET', /^\/policy$/, () => (db.policy ? { policy: db.policy, updatedAt: now() } : fail('loading ACL from database: acl policy not found', 500))],
	['PUT', /^\/policy$/, (m, q, b) => {
		try { JSON.parse(String(b.policy).replace(/\/\/.*$/gm, '')); } catch (e) { fail('parsing policy: ' + e.message); }
		db.policy = b.policy;
		return { policy: db.policy, updatedAt: now() };
	}],
];

// ── server ─────────────────────────────────────────────────────────
export function createServer() {
	return http.createServer(async (req, res) => {
		const send = (status, data) => {
			res.writeHead(status, { 'Content-Type': typeof data === 'string' ? 'text/plain' : 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' });
			res.end(typeof data === 'string' ? data : JSON.stringify(data));
		};
		if (req.method === 'OPTIONS') return send(204, '');
		const url = new URL(req.url, 'http://x');
		if (url.pathname === '/health') return send(200, { status: 'pass' });
		if (!url.pathname.startsWith('/api/v1/')) return send(404, '404 page not found');

		const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
		if (!token) return send(401, 'Unauthorized');
		// make the UI's apikey lookup (startsWith(prefix)) match whatever token is used
		const prefix = token.split('.')[0].slice(0, 7);
		if (!db.apiKeys.some((k) => token.startsWith(k.prefix))) mkApiKey(prefix);

		const path = url.pathname.slice('/api/v1'.length);
		const b = ['POST', 'PUT'].includes(req.method) ? await body(req) : {};
		if (DELAY) await new Promise((r) => setTimeout(r, DELAY));
		for (const [method, re, handler] of routes) {
			const m = method === req.method && path.match(re);
			if (!m) continue;
			try {
				return send(200, handler(m, url.searchParams, b, token));
			} catch (e) {
				return send(e.status ?? 500, { code: e.code ?? 13, message: e.message, details: [] });
			}
		}
		send(404, { code: 5, message: `Not Found: ${req.method} ${url.pathname}`, details: [] });
	});
}

if (FLAP) setInterval(() => { const n = db.nodes[Math.floor(Math.random() * db.nodes.length)]; if (n) { n.online = !n.online; n.lastSeen = now(); } }, 5000);

// ── self-test ──────────────────────────────────────────────────────
async function selftest() {
	const assert = (await import('node:assert/strict')).default;
	const srv = createServer().listen(0);
	await new Promise((r) => srv.on('listening', r));
	const base = `http://127.0.0.1:${srv.address().port}/api/v1`;
	const call = async (method, p, data, auth = 'Bearer mock-key') => {
		const r = await fetch(base + p, { method, headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: data && JSON.stringify(data) });
		return [r.status, await r.text().then((t) => { try { return JSON.parse(t); } catch { return t; } })];
	};
	assert.deepEqual(await call('GET', '/user', null, ''), [401, 'Unauthorized']);
	const [, { users }] = await call('GET', '/user');
	assert.equal(users.length, 4);
	const [, { apiKeys }] = await call('GET', '/apikey');
	assert.ok(apiKeys.some((k) => 'mock-key'.startsWith(k.prefix)), 'api key prefix matches token');
	const [s1, { user: u }] = await call('POST', '/user', { name: 'bob' });
	assert.equal(s1, 200);
	assert.equal((await call('POST', '/user', { name: 'bob' }))[0], 400, 'duplicate user rejected');
	const [, { node: n }] = await call('POST', `/node/register?user=bob&key=${hex(12)}`);
	assert.equal(n.user.name, 'bob');
	assert.equal((await call('DELETE', `/user/${u.id}`))[0], 500, 'user with nodes not deletable');
	const [, { node: r }] = await call('POST', '/node/5/approve_routes', { routes: ['10.0.0.0/8', '172.16.0.0/12', '1.2.3.0/24'] });
	assert.deepEqual(r.approvedRoutes, ['10.0.0.0/8', '172.16.0.0/12'], 'only advertised routes approved');
	assert.equal((await call('POST', '/node/1/tags', { tags: ['bad tag'] }))[0], 400);
	const [, { preAuthKey }] = await call('POST', '/preauthkey', { user: '1', reusable: true, ephemeral: false, expiration: inDays(1) });
	assert.equal(preAuthKey.reusable, true);
	const all = (await call('GET', '/preauthkey'))[1].preAuthKeys;
	assert.ok(all.some((p) => p.id === preAuthKey.id), 'list without ?user returns all keys');
	assert.equal((await call('DELETE', `/preauthkey?id=${preAuthKey.id}`))[0], 200);
	assert.ok(!(await call('GET', '/preauthkey'))[1].preAuthKeys.some((p) => p.id === preAuthKey.id), 'key deleted');
	assert.deepEqual((await call('GET', '/health'))[1], { databaseConnectivity: true });
	assert.equal((await call('PUT', '/policy', { policy: '{bad' }))[0], 400);
	assert.equal((await call('PUT', '/policy', { policy: '{"acls":[]}' }))[0], 200);
	assert.equal((await call('GET', '/nope'))[0], 404);
	srv.close();
	console.log('mock-headscale selftest: ok');
}

if (process.argv.includes('--selftest')) await selftest();
else if (import.meta.url === `file://${process.argv[1]}`) {
	createServer().listen(PORT, () => console.log(`mock headscale on http://localhost:${PORT}  (any Bearer token works${DELAY ? `, ${DELAY}ms delay` : ''}${FLAP ? ', flapping' : ''})`));
}
