# VH SMM Tracker

Stage 1 implementation includes:
- hardcoded admin login
- protected app shell with tabs
- dashboard, weekly planner, paid traffic, and admin tools pages
- basic Vercel-ready Next.js setup

## Local run
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

## Stage 1 credentials
- Login: `vhadmin`
- Password: `Melone#2020#vhsmm`

## Routes
- `/login`
- `/dashboard`
- `/planner`
- `/paid`
- `/tools` (admin-only user tools; add users and attach profile images)
- `/admin/users` (legacy path redirected to `/tools`)

## Important
These credentials are intentionally hardcoded only for initial validation. Stage 2 replaces this with secure database authentication and role management.
