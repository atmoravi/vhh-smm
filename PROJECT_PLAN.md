# VH SMM Tracker - Master Product + Build Plan

Last updated: 2026-03-06  
Repository: `vh-smm`  
Deployment target: Vercel (Next.js)

## 1) Product Purpose

VH SMM Tracker is a web app to compare:
- Organic social media effort/performance (Instagram, Facebook, TikTok, YouTube)
- Paid media performance (Meta Ads, TikTok Ads)

The core business objective is to answer:
- Is investment in organic content production (including worker salary/time) justified versus paid advertising performance?

## 2) Current Status (Implemented)

Release history:
- `v0.1.0`: initial Next.js app, hardcoded login, protected dashboard
- `a5e1357`: Next.js security upgrade to patched version
- `v0.2.0`: app boilerplate with tabbed modules and role-aware shell scaffolding

Current framework/setup:
- Next.js App Router + TypeScript
- Vercel-compatible build
- Login/logout with hardcoded admin credentials (temporary)
- Protected routes with session cookies
- Shared app shell and tab navigation

Current routes:
- `/login`
- `/dashboard`
- `/planner`
- `/paid`
- `/admin/users` (admin-only placeholder)

Current data state:
- UI uses mock data (`lib/mock-data.ts`)
- No real database yet
- No external platform API integration yet

## 3) Current Security State (Important)

Authentication is not production-grade yet:
- Credentials are hardcoded in code (temporary validation mode)
- Role/session cookie system is scaffolded only

Immediate requirement for next stage:
- Replace hardcoded auth with database-backed auth and hashed passwords

## 4) Role Model (Target)

The product should use 3 roles:
- `owner`: decision/ROI view; investment justification and trend conclusions
- `manager`: operations/performance optimization; planning and team monitoring
- `worker`: execution input; post planning/status/time/performance updates

High-level access boundaries:
- Owner: sees global business KPIs and ROI/catch-up outcomes
- Manager: sees planner + platform breakdown + team-level operational details
- Worker: sees assigned work and inputs only

## 5) Main Product Modules

1. Authentication + User Management
- Login/logout
- Admin user creation/invite
- Role assignment (`owner`, `manager`, `worker`)
- Session handling and password reset

2. Weekly Planner (Organic Work Tracking)
- Week-based records by post
- Fields: platform, theme, publish date, status, time spent, basic performance

3. Paid Traffic Tracking
- Week-based manual paid metrics entry (Meta/TikTok ads)
- Fields: spend, impressions, clicks, conversions (+ derived ratios)

4. Dashboard Layer
- Owner dashboard: ROI/catch-up and investment justification
- Manager dashboard: throughput, quality, bottleneck and execution monitoring

5. Integrations
- Meta/TikTok APIs (paid and/or organic where available)
- Optional YouTube/Instagram/TikTok content metric sync

## 6) KPI Framework (Target Definitions)

All KPI formulas should be fixed and versioned to keep reporting consistent.

Primary comparison metrics:
- Organic Efficiency = `Organic Qualified Outcome / Labor Cost`
- Paid Efficiency = `Paid Qualified Outcome / Ad Spend`
- Catch-up Ratio = `Organic Efficiency / Paid Efficiency`
- Investment Justified = `Catch-up Ratio >= threshold` (threshold configurable)

Operational supporting metrics:
- Organic views/subscriber growth by week/platform
- Content production throughput
- Average production time per post
- On-time publication rate
- Paid CPC/CPM/CTR/conversion trends

## 7) Data Model Roadmap (Target)

Planned core entities:
- `User` (role, active state, auth metadata)
- `Week` (start/end, label)
- `OrganicPost` (planner and organic metrics)
- `PaidWeeklyMetrics` (manual paid stats by week/platform)
- `TeamMemberCost` (hourly/monthly labor assumptions)
- `KPIWeeklySnapshot` (precomputed KPI values for dashboards)

Implementation approach:
- Start with Postgres + Prisma
- Move from mock data to DB-backed queries progressively by module

## 8) Technical Architecture Roadmap

Phase A - Foundation Hardening
- Real DB auth + role-based authorization
- Password hashing + secure sessions
- Input schema validation (zod)

Phase B - Data Entry Modules
- Full CRUD for planner and paid tables
- Week selection/filtering
- Ownership/assignment constraints by role

Phase C - Decision Dashboards
- Owner dashboard (ROI/catch-up justification)
- Manager dashboard (execution + optimization)

Phase D - Integrations
- External API adapters for Meta/TikTok (+ optional YouTube)
- Scheduled sync jobs + manual override strategy

Phase E - Production Quality
- Audit fields, error tracking, logging
- Tests (unit + access control + basic E2E)
- CI checks and deployment guardrails

## 9) Suggested Build Stages (Execution Order)

Stage 1 (done):
- Vercel deployment baseline
- Hardcoded auth
- Tabbed boilerplate routes

Stage 2 (next):
- Real authentication
- 3-role system (`owner`, `manager`, `worker`)
- Admin/owner-managed user CRUD

Stage 3:
- Persisted weekly planner CRUD
- Persisted paid weekly metrics CRUD

Stage 4:
- Owner dashboard KPI logic (investment justification)
- Manager dashboard KPI logic (operational control)

Stage 5:
- API ingestion and scheduled sync
- Manual correction/override controls

Stage 6:
- Hardening, tests, CI, release process formalization

## 10) Current Code Reference (for New AI Agents)

Current auth and route scaffolding:
- `lib/auth.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`

Shared UI shell:
- `components/app-shell.tsx`
- `components/logout-button.tsx`

Current feature pages:
- `app/dashboard/page.tsx`
- `app/planner/page.tsx`
- `app/paid/page.tsx`
- `app/admin/users/page.tsx`

Current mock models/data:
- `lib/types.ts`
- `lib/mock-data.ts`

## 11) Non-Negotiables Going Forward

- Remove hardcoded credentials before production use.
- Never mix owner-level business KPIs with worker-only task views in one screen.
- Keep KPI formulas explicit and stable (no silent metric changes).
- Preserve manual entry path even after API integration (for correction/fallback).
- Maintain release tagging discipline (`vX.Y.Z`) with notes per stage.

## 12) Immediate Next Task (Recommended)

Implement Stage 2 end-to-end:
- Postgres + Prisma schema
- DB-backed login
- 3-role access control
- User management page from placeholder to functional CRUD

