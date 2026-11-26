# headscale-gui (Headscale VPN) — Agent Context

Web admin panel for [Headscale](https://github.com/juanfont/headscale) (self-hosted Tailscale control server).
Fork of [GoodiesHQ/headscale-admin](https://github.com/GoodiesHQ/headscale-admin) (GPL-3.0 — keep license + upstream credit).
Repo: `github.com/tjunussov/headscale-gui` · remotes: `origin` = fork, `upstream` = GoodiesHQ.

## Product rule (current phase)

**Same UX as upstream, shadcn components + monochrome.** Keep upstream's structure, menu (Home, Users, Nodes, Deploy, Routes, ACLs, Settings — this order), page titles, labels (incl. trailing colons like `Name:`), flows (accordion list ⇄ tile view, inline create forms, trash → ✓/✗ confirm, per-tab ACL save) exactly. Only swap Skeleton widgets for shadcn-svelte equivalents and remove color.
- Monochrome: neutral palette only. Exceptions: `destructive` (errors, delete, expired) and **online status = emerald green** (user request, polish phase) — filled green dot / green outline badge via `StatusDot`; offline = hollow grey ring. Offline node tiles render at `opacity-50`.
- Don't add features/pages/labels that upstream doesn't have without asking.
- **Polish phase (branch `polish`)**: user-approved restyles only, keeping upstream structure. Done:
  - Home's six tiles use shadcn dashboard "section cards" (gradient, icon badge, footer line + sub, whole card clickable).
  - Header: trigger | separator | `group › page` breadcrumb. PageHeader (design A): row 1 = title `text-2xl font-semibold` + `text-sm` description (from `nav.ts`) | Create (+ icon) right; create form slides below; row 2 = children (SortFilterBar tabs) left | search (InputGroup + icon) + view toggle right.
  - Design names: **A** = my earlier shadcn design (branch `shadcn`), **B** = upstream original, **C** = merged polish (branch `polish`).
  - Sidebar: `variant="inset"`, brand block (Headscale VPN / server host), version in footer, grouped sections Overview (Home) · Network (Machines, Routes, ACLs) · Tools (Users, Settings). Supersedes the menu rule above.
  - "Nodes" is labelled **Machines** in the UI (Tailscale wording); URL `/nodes`, API and code keep "node".
  - Machines page borrows from Tailscale: table (Machine/owner/pills · Addresses ▾ · Last Seen · ⋮), `MachineMenu`, `MachineIp`, Exit Node/Subnet pills (`machinePills`), CSV export, search over name/owner/tag/IP.
  - **Add machine** dialog (`AddDeviceDialog`): OS picker + tabs Download / Connect / Register / Advanced. Advanced = `DeployBuilder` (the former Deploy page, with `DeployCheck`). `/nodes/?add[=tab]` opens it; Deploy is no longer a menu item.
  - **Remembered UI state** via `$lib/common/ui` (`uiLoad`/`uiSave`, localStorage `ui:<key>`): Machines/Users/Routes sort+direction+online filter+search, ACL tab, Add machine OS+tab, last page (app root resumes it on first load). New pages with filters/tabs should do the same. Layouts (tile/list/table) and settings use `StateLocal`.
  - **Machine page** `src/routes/nodes/[id]/` (`/nodes/<ipv4 or id>/`, link via `machineHref`): not prerendered; served by the SPA fallback `200.html` (adapter-static `fallback`). Any web server must fall back to `<ENDPOINT>/200.html` for unknown paths (Caddyfile does). Tiles, table, Home recent, user machine list and the ⋮ menu open it; the drawer is now only for users.
- Run the original side by side to compare: `git worktree add <dir> upstream/main`, `npm ci`, add a vite `/api` proxy to the mock, `npx vite dev --port 5174`.

## Stack

- SvelteKit 2 + **Svelte 5 runes**, TypeScript, `adapter-static` (pure static SPA, `ssr = false`), base path from `ENDPOINT` env.
- **Tailwind v4** (`@tailwindcss/vite`, no tailwind.config) + **shadcn-svelte 1.x** (bits-ui), style `vega`, base color `neutral`, icons `@lucide/svelte`.
- `mode-watcher` (light/dark/system), `svelte-sonner` toasts, `svelte-jsoneditor` + `json5` for ACL HuJSON.
- Add UI parts with `npx shadcn-svelte@latest add <name>` (needs a TTY or `-y`; use `-o` when it asks to overwrite unmodified shared deps). Generated code lives in `src/lib/components/ui/` — don't hand-edit it; wrap it instead.

## Layout of the code

```
src/app.css                      theme tokens (shadcn CSS vars) — the only global CSS
src/routes/+layout.svelte        Sidebar.Provider shell, Toaster, ModeWatcher, PageDrawer, polling bootstrap
src/routes/{,users,nodes,routes,acls,settings}/+page.svelte   (deploy/ only redirects to /nodes/?add=advanced)
src/routes/acls/{Groups,TagOwners,Hosts,Policies,SshRules,Config}.svelte   ACL tabs
src/lib/nav.ts                   menu items (Settings must stay last: shown alone without a valid API key)
src/lib/components/app-sidebar.svelte, site-header.svelte
src/lib/components/ui/*          shadcn-svelte generated components
src/lib/page/                    Page (flex column), PageHeader (title, list/tile toggle, Create + Search), PageDrawer (Sheet for user/node details)
src/lib/cards/                   CardList* (Accordion list), CardTile* (Card grid), CardListEntry (label/value row), per-entity field components
src/lib/parts/                   small shared widgets: Delete, Text (inline rename), SortFilterBar, StatusDot, TagInput, MultiSelect, ObjectPicker, ObjectList, AclToolbar, NewItem
src/lib/States.svelte.ts         global `App` state: users/nodes/preAuthKeys, api url/key/ttl, layouts, deployment defaults; polling (populateAll)
src/lib/common/api/*             Headscale REST client (get/create/modify/delete)
src/lib/common/acl.svelte.ts     ACLBuilder: policy model + mutations; saveConfig()
src/lib/common/funcs.ts          sorting/filtering, time formatting, toast helpers (sonner), openDrawer/closeDrawer
src/lib/common/drawer.svelte.ts  global drawer $state (id like 'userDrawer-1' / 'nodeDrawer-3')
mock-headscale.js                in-memory Headscale v0.26 REST mock (node stdlib only)
```

Conventions: Svelte 5 runes only (`$state/$derived/$props`), compact code, reuse parts above before writing new ones. Toasts: `toastSuccess(msg)`, `toastError(msg, err?)` — no store args. Details panel: `openDrawer('nodeDrawer-' + id, node)`. Don't mutate `$state` inside getters/`$derived` (crashes with `state_unsafe_mutation`).

## Commands

```bash
npm install
npm run dev:mock      # mock Headscale :8081 + vite :5173 (proxied /api). Settings: empty API URL, any key (e.g. mock-key)
npm run dev           # UI only; HEADSCALE=http://host:8080 npm run dev to proxy a real server (no CORS needed)
npm run test:mock     # mock self-test
npx svelte-check --tsconfig ./tsconfig.json   # type check — must be 0 errors
npm run build         # static build → ./build ; ENDPOINT=/admin for sub-path
docker build -t headscale-gui .                  # Caddy image, served at /admin by default
```
Mock knobs: `MOCK_DELAY=600` (slow responses), `MOCK_FLAP=1` (nodes flip online/offline). Mock accepts any bearer token — test auth against a real Headscale.

Quality gate before commit: `svelte-check` 0 errors, `npm run build` ok, `npm run test:mock` ok, click through changed pages with `dev:mock` (check light + dark, browser console clean).

## Workflow

- **Issues:** beads (`bd`). Epics for phases, tasks as children (`bd create ... --parent <epic>`). Claim → work → close. No markdown TODOs.
- **Branches:** `main` = released. Every major change goes on its own branch, developed in a **git worktree** under `.claude/worktrees/<branch>` (ignored by git). Open a PR into the parent branch; never commit directly to `main`.
- Current lineage: `main` ← `shadcn` (PR #1, Skeleton → shadcn-svelte migration + mock) ← `ux-parity` (restore upstream UX, monochrome) ← `upstream-028` (port upstream v0.28.0) ← `polish` (taste restyles).
- Commits: imperative summary + body, end with the Co-Authored-By trailer. Push before ending a session (see below).
- **Upstream baseline = release tags, not `upstream/main`** (main lags; v0.27/v0.28 exist only as tags). Current baseline: **v0.28.0** (Headscale 0.28 API: node `tags`, `/api/v1/health`, list-all + DELETE preauth keys, keys created on Deploy, Auto Approvers tab).
- Pull upstream: `git fetch upstream --tags`, then `git diff <old-tag> <new-tag> -- <logic files> | git apply --3way` for `src/lib/common/**` + `States.svelte.ts`; port UI deltas by hand onto shadcn parts. Skip `src/lib/common/client/` (generated, unused). Mirror API changes in `mock-headscale.js` + its selftest.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:7510c1e2 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
