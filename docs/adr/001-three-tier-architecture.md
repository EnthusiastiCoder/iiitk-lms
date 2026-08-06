# ADR-001: Three-Tier Architecture

**Status:** Accepted  
**Date:** 2026-08-06  
**Decision Makers:** Arpan Mandal

## Context

The LMS was initially built as a Next.js monolith where Server Actions directly queried Supabase. While functional, this architecture:

- Couples frontend and backend tightly (no API boundary)
- Makes it impossible to use the backend from other clients (mobile, CLI)
- Violates separation of concerns (presentation logic mixed with business logic)
- Cannot be deployed or scaled independently

## Decision

Migrate to a three-tier architecture:

1. **Presentation Tier** — Next.js 15 on Vercel (SSR, React UI, no DB access)
2. **Application Tier** — Express.js REST API on Render (business logic, auth, DB access)
3. **Data Tier** — Supabase Postgres (database only, no client-side SDK)

## Alternatives Considered

- **Next.js API Routes as middle tier** — Rejected: still couples frontend and backend deployment, not a true separation.
- **tRPC** — Rejected: tightly couples to TypeScript clients, not standard REST.
- **GraphQL** — Rejected: over-engineering for the current scope.

## Consequences

- **Positive:** Clean separation, independent deployment, reusable API, proper auth (JWT)
- **Negative:** More infrastructure (two deployments), network latency between tiers, more complex auth flow
- **Migration effort:** ~39 commits to restructure, significant but one-time cost

## Technical Details

- **Auth:** Express manages JWT tokens (access + refresh). No Supabase Auth SDK on frontend.
- **Storage:** Cloudinary replaces Supabase Storage for file uploads.
- **Realtime:** Polling replaces Supabase Realtime for grading notifications.
- **Monorepo:** Turborepo + npm workspaces (`apps/api`, `apps/web`, `packages/shared`).
