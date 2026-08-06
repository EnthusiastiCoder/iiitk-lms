# IIIT Kalyani LMS

A gamified Learning Management System for IIIT Kalyani, built as a three-tier
monorepo with Next.js, Express, and Supabase.

## Architecture

```
 Browser
   |
   v
+-------------------+         +-------------------+         +-------------------+
|                   |  REST   |                   |  SQL    |                   |
|   Next.js 16      | ------> |   Express 5 API   | ------> |   Supabase        |
|   (Vercel)        | <------ |   (Render)        | <------ |   (PostgreSQL)    |
|                   |   JSON  |                   |         |                   |
+-------------------+         +-------------------+         +-------------------+
  Port 3000 (dev)               Port 10000 (dev)              Hosted (cloud)
                                       |
                                       v
                              +-------------------+
                              |   Cloudinary      |
                              |   (file uploads)  |
                              +-------------------+
```

**Frontend** serves SSR pages and calls the API with JWT auth.
**API** handles all business logic, auth, and database access.
**Supabase** provides PostgreSQL, Auth (user creation), and Realtime (grading notifications).

## Features

- **Student Portal** -- Course browsing, lesson completion with XP, quizzes,
  assignments, projects, achievements, leaderboard, streaks, flashcards
- **Professor Portal** -- Course content CRUD, student roster, grading center, analytics
- **Admin Panel** -- User management, course administration, achievement management,
  system analytics (user growth, enrollment distribution)
- **Gamification** -- XP system, levels, tiers (bronze/silver/gold/diamond),
  streaks, achievements, leaderboard
- **Real-time** -- Grading notifications via Supabase Realtime
- **Observability** -- Axiom (structured logging), Sentry (error tracking)

## Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Frontend    | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui  |
| API         | Express 5, Zod validation, JWT auth               |
| Database    | Supabase (PostgreSQL, Auth, Realtime)              |
| Uploads     | Cloudinary (streaming via multer)                  |
| Shared      | TypeScript types package (@lms/shared)             |
| Build       | Turborepo (npm workspaces)                         |
| Code Editor | CodeMirror (JS/Python syntax)                      |
| Animations  | Motion (framer-motion successor)                   |
| E2E Tests   | Playwright (39 tests, 7 spec files)                |
| Monitoring  | Axiom (API logs), Sentry (frontend + API errors)   |

## Monorepo Structure

```
iiitk-lms-monorepo/
  apps/
    api/             Express REST API
    web/             Next.js frontend
  packages/
    shared/          Shared TypeScript types (@lms/shared)
  docs/
    adr/             Architecture Decision Records
```

Each app has its own `CODEMAP.md` with a full file map.
See [`CODEMAP.md`](CODEMAP.md) for the top-level overview.

## Local Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project (for PostgreSQL and Auth)

### 1. Clone and install

```bash
git clone <repo-url>
cd iiitk-lms-monorepo
npm install
```

### 2. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edit each file with your credentials (see sections below).

### 3. Run both servers

```bash
npm run dev          # Starts both API and web via Turborepo
```

- **Web:** http://localhost:3000
- **API:** http://localhost:10000
- **Swagger Docs:** http://localhost:10000/api-docs

To run individually:

```bash
cd apps/api && npm run dev    # API only
cd apps/web && npm run dev    # Web only
```

## Environment Variables

### apps/api/.env

| Variable                  | Required | Description                            |
|---------------------------|----------|----------------------------------------|
| `PORT`                    | No       | Server port (default: 10000)           |
| `NODE_ENV`                | No       | development / production / test        |
| `SUPABASE_URL`            | Yes      | Supabase project URL                   |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes    | Supabase service role key              |
| `JWT_SECRET`              | Yes      | JWT signing secret (min 32 chars)      |
| `JWT_REFRESH_SECRET`      | Yes      | Refresh token secret (min 32 chars)    |
| `JWT_EXPIRY`              | No       | Access token expiry (default: 1h)      |
| `JWT_REFRESH_EXPIRY`      | No       | Refresh token expiry (default: 7d)     |
| `CLOUDINARY_CLOUD_NAME`   | No       | Cloudinary cloud name                  |
| `CLOUDINARY_API_KEY`      | No       | Cloudinary API key                     |
| `CLOUDINARY_API_SECRET`   | No       | Cloudinary API secret                  |
| `AXIOM_TOKEN`             | No       | Axiom ingest token (logging)           |
| `AXIOM_DATASET`           | No       | Axiom dataset name (default: backend)  |
| `SENTRY_DSN`              | No       | Sentry DSN (error tracking)            |
| `FRONTEND_URL`            | No       | Frontend URL for CORS (default: http://localhost:3000) |

### apps/web/.env.local

| Variable                     | Required | Description                         |
|------------------------------|----------|-------------------------------------|
| `NEXT_PUBLIC_API_URL`        | Yes      | API server URL (http://localhost:10000) |
| `NEXT_PUBLIC_SUPABASE_URL`   | No       | Supabase URL (E2E test seeding only)   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No    | Supabase anon key (E2E only)           |
| `SUPABASE_SERVICE_ROLE_KEY`  | No       | Service role key (E2E only)            |
| `NEXT_PUBLIC_SENTRY_DSN`     | No       | Sentry DSN (error tracking)            |
| `SENTRY_ORG`                 | No       | Sentry organization slug               |
| `SENTRY_PROJECT`             | No       | Sentry project slug                    |

## Testing

```bash
cd apps/web
npm run test:e2e          # Run all Playwright E2E tests
npm run test:e2e:ui       # Run with Playwright UI mode
```

E2E tests require both servers running and test accounts configured via
`E2E_*` environment variables (see `apps/web/.env.example`).

## Deployment

| App  | Platform | Build Command | Start Command                          |
|------|----------|---------------|----------------------------------------|
| web  | Vercel   | `next build`  | `next start`                           |
| api  | Render   | `tsc`         | `node dist/apps/api/src/index.js`      |

Both deploy automatically from the main branch.

## Code Quality Standards

Enforced via ESLint (CI blocks on violation):

- **max-lines:** 300 per file
- **max-lines-per-function:** 75
- **max-params:** 4
- **no-explicit-any:** error (zero type holes)
- **no-console:** error (use Logger class in API)
- **explicit-function-return-type:** error on exports

Documentation requirements:
- `CODEMAP.md` per app with file responsibilities
- Swagger/OpenAPI annotations on all API routes (`/api-docs`)
- JSDoc on all exported functions
- ADRs for major architectural decisions (`docs/adr/`)

See [ADR-002](docs/adr/002-code-quality-standards.md) for full details.
