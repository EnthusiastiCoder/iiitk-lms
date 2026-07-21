# IIIT Kalyani LMS

A gamified Learning Management System for IIIT Kalyani, built with Next.js 15, Supabase, and Tailwind CSS.

## Features
- **Student Portal**: Course browsing, lesson completion with XP, quizzes, assignments, skill trees, achievements, leaderboard
- **Professor Portal**: Student management, grading, course content CRUD, analytics
- **Admin Panel**: User management, course administration, system analytics, achievement management
- **Gamification**: XP system, levels, tiers, streaks, achievements, leaderboard
- **Real-time**: Grading notifications via Supabase Realtime
- **Observability**: Axiom logging, Sentry error tracking

## Tech Stack
- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Database**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Testing**: Playwright E2E (39 tests across 7 spec files)
- **Monitoring**: Axiom (logging), Sentry (error tracking)
- **Deployment**: Vercel

## Getting Started
1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in values
3. Run `npm install`
4. Run `npm run dev`
5. Open http://localhost:3000

## Environment Variables
See `.env.example` for all required variables.

## Testing
```bash
npm run test:e2e       # Run all E2E tests
npm run test:e2e:ui    # Run with Playwright UI
```

## Deployment
Deployed on Vercel with automatic deployments from main branch.
