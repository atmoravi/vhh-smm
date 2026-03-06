# VH SMM Tracker - Build Plan

## Stage 1 - Baseline Access + Dashboard (current)
- Next.js app on Vercel-ready stack.
- Hardcoded admin login for quick validation:
  - Login: `vhadmin`
  - Password: `Melone#2020#vhsmm`
- Protected app shell and routes:
  - Dashboard
  - Weekly Planner
  - Paid Traffic
  - Admin Users (placeholder)
- Top-left brand in dashboard: `VH SMM Tracker`.

## Stage 2 - Real Authentication + Roles
- Replace hardcoded auth with database-backed users.
- Roles: `admin`, `worker`.
- Admin can create/invite users.
- Session security, password hashing, login audit.

## Stage 3 - Weekly Planner Module
- Week-based workspace with tabs.
- Worker entries per post:
  - platform
  - theme/topic
  - publish date
  - status
  - time spent
  - organic metrics (views, reactions, followers delta)
- Admin overview across workers.

## Stage 4 - Paid Traffic Module
- Week-based manual paid metrics for Meta/TikTok:
  - spend, impressions, clicks, CTR, CPC, CPM, conversions
- Aggregated weekly view and trend history.

## Stage 5 - Comparison Analytics
- Organic vs Paid comparison layer:
  - performance per hour (organic effort efficiency)
  - performance per spend (paid efficiency)
  - "catch-up" indicator and trend line
- Dashboard KPI cards and charts.

## Stage 6 - API Integrations
- Meta API and TikTok API connectors.
- Optional YouTube/Instagram/TikTok pulls for organic metrics.
- Scheduled sync jobs and manual override for corrections.

## Stage 7 - Production Hardening
- Input validation, error handling, logging.
- Role-based access tests.
- CI checks in GitHub (lint, typecheck, tests).
- Vercel env vars and deployment workflow.
