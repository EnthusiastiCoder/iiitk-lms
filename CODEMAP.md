# CODEMAP

Monorepo architecture map for the IIIT Kalyani LMS.

## Monorepo Structure

```
iiitk-lms-monorepo/
  apps/api/        Express.js REST API (deployed to Render)
  apps/web/        Next.js 16 frontend (deployed to Vercel)
  packages/shared/ Shared TypeScript types (@lms/shared)
  docs/adr/        Architecture Decision Records
```

## apps/api/

Express 5 REST API. Handles authentication, course data, gamification,
file uploads, and role-gated admin/professor operations. Runs on port 10000.

- **Runtime:** Node.js + tsx (dev), tsc-compiled JS (prod)
- **Database:** Supabase (PostgreSQL via service-role client, bypasses RLS)
- **Auth:** JWT access + refresh tokens (jsonwebtoken)
- **Uploads:** Cloudinary (streaming via multer)
- **Observability:** Axiom (batched structured logs), Sentry (error tracking)
- **Docs:** Swagger UI at `/api-docs` (swagger-jsdoc annotations in routes)

See [`apps/api/CODEMAP.md`](apps/api/CODEMAP.md) for the full file map.

## apps/web/

Next.js 16 frontend with App Router, Server Components, and Server Actions.
Three role-based portals: student, professor, admin.

- **Styling:** Tailwind CSS v4, shadcn/ui, tw-animate-css
- **Editor:** CodeMirror (JS/Python syntax, one-dark theme)
- **Animations:** Motion (framer-motion successor)
- **Auth:** JWT stored in cookies, middleware guards routes
- **E2E Tests:** Playwright (39 tests across 7 spec files)
- **Observability:** Sentry (error tracking)

See [`apps/web/CODEMAP.md`](apps/web/CODEMAP.md) for the full file map.

## packages/shared/

Shared TypeScript package (`@lms/shared`). No build step -- consumed as
raw TS via bundler module resolution.

- `src/index.ts` -- Barrel re-export of all types
- `src/types.ts` -- Domain model interfaces (Profile, Course, Module, Lesson, Quiz, Assignment, Project, Enrollment, Achievement, etc.)
- `src/api.ts` -- API contract types (ApiResponse, ApiError, AuthTokens, PaginatedResponse, request/response shapes)

## docs/adr/

Architecture Decision Records documenting major design choices.

- `001-three-tier-architecture.md` -- Migration from Next.js monolith to three-tier (Next.js + Express + Supabase)
- `002-code-quality-standards.md` -- ESLint rules (max-lines 300, no-explicit-any, etc.) and documentation requirements

## Root Config

- `package.json` -- npm workspaces (`apps/*`, `packages/*`), Turborepo scripts
- `turbo.json` -- Task pipeline: build, dev, lint, typecheck, clean
- `CLAUDE.md` -- AI assistant instructions for this repo
