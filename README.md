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

## 1) Prerequisites (Windows)

1. Install **Node.js 20+**
2. Install **Docker Desktop** and ensure it is running
3. Install **Supabase CLI**
   - Docs: https://supabase.com/docs/guides/cli

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
