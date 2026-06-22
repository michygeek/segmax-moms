# SEGMAX OIL NIG LTD — Manufacturing Operations Management System (MOMS)

Internal ERP for SEGMAX's lubricant manufacturing operations: Production, Inventory,
Quality Control, HR, Sales & Distribution, and Safety — built on Next.js 15, Prisma 7,
PostgreSQL (Supabase), Auth.js, and shadcn/ui.

## Tech stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- Prisma 7 (driver adapter: `@prisma/adapter-pg`) + PostgreSQL
- Auth.js v5 (Credentials provider, JWT sessions, role-based middleware)
- Supabase Storage (COA documents, training certificates)
- Recharts, React Hook Form, Zod
- PWA (installable on desktop/mobile, via Serwist — see [PWA](#pwa) below)

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project.
2. Once provisioned, go to **Project Settings → Database → Connection string**.
   - Copy the **Transaction pooler** string (port `6543`) → this is `DATABASE_URL`.
   - Copy the **Session/Direct** string (port `5432`) → this is `DIRECT_URL`.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (not the anon key) → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Storage** → create a new **public** bucket named `coa-documents`
   (or any name, matching `SUPABASE_COA_BUCKET`).

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY` from step 1. Generate `AUTH_SECRET` with:

```bash
npx auth secret
```

## 3. Install dependencies, migrate, and seed

```bash
npm install
npx prisma migrate dev --name init
npm run seed
```

The seed script creates one demo user per role (password for all: `Passw0rd!`):

| Role | Email |
|---|---|
| CEO | ceo@segmaxoil.com |
| Super Admin | admin@segmaxoil.com |
| Production Manager | production@segmaxoil.com |
| Store Manager | store@segmaxoil.com |
| QC Officer | qc@segmaxoil.com |
| HR Officer | hr@segmaxoil.com |
| Sales Officer | sales@segmaxoil.com |
| Safety Officer | safety@segmaxoil.com |

It also seeds sample raw materials, stock lots, a product, an in-progress batch,
a sales order, employees, and safety records so every dashboard/list has data.

## 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with any seeded account.

## Project structure

```
prisma/schema.prisma      Database schema (28 models across 6 domains)
prisma/seed.ts            Demo data seed script
prisma.config.ts          Prisma 7 CLI config (migration connection)
src/
  middleware.ts            Auth + role-based route protection
  auth.ts                  Auth.js v5 config (Credentials provider)
  app/
    login/                 Login page
    (dashboard)/            Authenticated shell: sidebar, header, all modules
    api/                    REST API routes (mirror the service layer)
  components/
    ui/                     shadcn/ui primitives
    layout/                 Sidebar, header, nav
    dashboard/               KPI cards, charts
    shared/                  DataTable, StatusBadge, PageHeader, etc.
    <module>/               Module-specific forms and views
  lib/
    services/                Business logic + permission checks + audit logging
    validations/              Zod schemas
    permissions.ts            Role → module access matrix
    prisma.ts, supabase.ts, audit.ts, notify.ts, utils.ts
```

## Useful commands

```bash
npx prisma studio        # browse the database
npx prisma migrate dev   # create/apply a new migration
npm run seed              # re-run the seed script
npm run build              # production build / type-check
```

## PWA

The app is installable (desktop and mobile "Add to Home Screen" / "Install app") via a
web manifest (`src/app/manifest.ts`) and a Serwist-built service worker
(`src/app/sw.ts` → compiled to `public/sw.js` on every `npm run build`).

- Static assets (JS/CSS/fonts/images) are precached/cached for fast, app-like loads.
- Pages and `/api/*` routes always use the network first — the app never shows stale
  production/inventory/safety data while online. If the network is unreachable, a
  minimal "You're offline" page (`src/app/~offline`) is shown instead of a browser error.
- The service worker only runs in production builds (`npm run build && npm run start`);
  `npm run dev` does not register one, so you won't see cached responses while developing.
- To change the app icon, edit `scripts/generate-pwa-icons.mjs` and re-run
  `node scripts/generate-pwa-icons.mjs` to regenerate every icon size.
