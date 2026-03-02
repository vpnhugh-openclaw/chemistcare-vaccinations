# ChemistCare PrescriberOS

Clinical prescribing and pharmacy workflow app.

## Local-first PC mode (offline capable)

You can run this app entirely on a local Windows PC without relying on public internet services at runtime.

### Architecture for local mode
- **Frontend:** Vite React app (localhost)
- **Backend/Data/Auth:** local Supabase stack in Docker (localhost)
- **Data location:** your PC (local Postgres container)

> Note: first-time setup may require internet to install dependencies and pull Docker images. After setup, day-to-day use can run on local network/offline.

---

## 1) Prerequisites (Windows or macOS)

1. Install **Node.js 20+**
2. Install **Docker Desktop** and ensure it is running
3. Install **Supabase CLI**
   - Docs: https://supabase.com/docs/guides/cli
   - macOS Homebrew: `brew install supabase/tap/supabase`

---

## 2) Setup

```bash
npm install
```

Bootstrap local Supabase + local env file:

```bash
npm run local:bootstrap
```

This command will:
- start local Supabase containers
- read local API/anon key from `supabase status -o env`
- generate `.env.local` with local values

---

## 3) Run locally

```bash
npm run local:dev
```

Open:
- App: http://localhost:5173

---

## 4) Stop local backend

```bash
supabase stop
```

---

## 5) Reset local DB (if needed)

```bash
supabase db reset
```

This reapplies migrations from `supabase/migrations`.

---

## 6) Existing cloud mode

If you want to use hosted Supabase again, remove/rename `.env.local` and use `.env` cloud variables.

---

## Scripts

- `npm run dev` — normal dev mode
- `npm run local:bootstrap` — prepare local/offline mode env + local Supabase
- `npm run local:dev` — run app for LAN/local PC access
- `npm run build` — production build
- `npm run test` — run tests

---

## Notes for robust offline operations

For pharmacy floor reliability:
- Keep Docker Desktop set to auto-start on login
- Keep periodic local backups (`supabase db dump`)
- Use UPS for host PC to reduce corruption risk
- Plan a sync/export workflow for when internet is available (future enhancement)

### macOS one-click launcher

You can also run:
- `scripts/mac-start.command` (starts local backend + app)
- `scripts/mac-stop.command` (stops local backend)

Tip: move `mac-start.command` to your Desktop for one-click launch.

## macOS packaged app (.app/.dmg)

You can package ChemistCare as a normal Mac app.

### Build installer

```bash
npm install
npm run local:bootstrap
npm run electron:build
```

Output will be in `dist_electron/` (DMG + ZIP).

### Run desktop app in dev mode

```bash
npm run electron:dev
```

### Important runtime note

The desktop app still needs the local Supabase backend running on your Mac.
Use:

```bash
npm run mac:start
```

Or at minimum run `npm run local:bootstrap` once and keep Docker/Supabase local stack running.
