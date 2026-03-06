# VH SMM Tracker

Purpose:
- Compare organic SMM effort/performance versus paid campaign performance.
- Help owner decide if team salary/time investment is justified compared to ad spend outcomes.

Current implementation includes:
- protected app shell with tabs and role scaffolding
- tools page for creating users (DB mode with local fallback)
- API + Prisma schema for users, weeks, time entries, organic posts, and paid metrics
- Next.js setup for Vercel deployment

## Local run
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

## Database setup (Vercel Postgres)
1. Create a Vercel Postgres database in your Vercel project.
2. Add `DATABASE_URL` env var (local `.env.local` and Vercel project envs).
3. Generate Prisma client:
   - `npm run db:generate`
4. Apply schema:
   - Local dev DB: `npm run db:migrate`
   - Existing/hosted DB quick sync: `npm run db:push`
5. Seed bootstrap records:
   - `npm run db:seed`

After DB is connected:
- `GET /api/health/db` returns `{ ok: true, database: "connected" }`
- Tools user creation writes to Postgres via `/api/users`

## Stage 1 credentials
- Login: `vhadmin`
- Password: `Melone#2020#vhsmm`

## Routes
- `/login`
- `/dashboard`
- `/planner`
- `/timetable`
- `/paid`
- `/work-time-settings` (admin-only hourly rate settings)
- `/tools` (admin-only user tools; add users and attach profile images)
- `/admin/users` (legacy path redirected to `/tools`)

## API routes (DB foundation)
- `GET/POST /api/users`
- `GET/POST /api/weeks`
- `GET/POST /api/time-entries`
- `GET/POST /api/organic-posts`
- `GET/POST /api/paid-metrics`
- `GET/POST /api/work-rates`
- `GET /api/health/db`

## Important
- Login is still hardcoded for bootstrap access while DB auth integration is completed.
- Worker/manager/owner authentication flow should be moved fully to DB-backed login next.
