# IIIT Kalyani LMS — Code Map

## Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register, confirm)
│   ├── (student)/         # Student layout + 12 pages
│   ├── (professor)/       # Professor layout + 7 pages
│   └── (admin)/           # Admin layout + 5 pages
├── actions/               # Server Actions (all data mutations)
│   ├── auth.ts           # Login, register, logout
│   ├── courses.ts        # Course queries, enrollment
│   ├── lessons.ts        # Lesson completion, flashcards
│   ├── submissions.ts    # Quiz, assignment, project submissions + grading
│   ├── content/          # Professor CRUD (modules, lessons, quizzes, assignments, projects)
│   ├── admin.ts          # User management, system stats
│   ├── professor.ts      # Student roster, class stats
│   ├── achievements.ts   # Achievement checking/unlocking
│   ├── streaks.ts        # Streak calculation
│   ├── profile.ts        # Profile updates
│   ├── upload.ts         # File upload URL persistence
│   └── gamification.ts   # Leaderboard, weekly XP
├── components/
│   ├── ui/               # shadcn/ui primitives (15 components)
│   ├── layout/           # Student sidebar, mobile nav
│   ├── courses/          # Course catalog, modules, lesson viewer
│   ├── quiz/             # Quiz taker, questions, results
│   ├── submissions/      # Code editor, file upload
│   ├── flashcard/        # Flashcard deck with 3D flip
│   ├── skill-tree/       # Interactive skill tree
│   ├── xp/               # XP celebration overlay
│   ├── profile/          # Profile editor, activity heatmap
│   ├── editor/           # CodeMirror wrapper
│   ├── motion/           # Animation helpers
│   ├── realtime/         # Supabase Realtime listeners
│   ├── professor/        # Professor-specific components
│   └── admin/            # Admin-specific components
├── lib/
│   ├── supabase/         # Supabase client (server, browser, middleware)
│   ├── logger.ts         # Axiom backend logging (batched)
│   ├── axiom-web-vitals.ts # Axiom frontend logging (batched)
│   ├── rate-limit.ts     # In-memory rate limiter
│   ├── tiers.ts          # Shared tier configuration
│   └── utils.ts          # cn() class merger
└── types/
    └── database.ts       # Shared domain types
```

## Data Flow
- Pages (server components) fetch data via server actions or Supabase server client
- Client components receive data as props, handle interactions
- Mutations go through server actions → Supabase → revalidatePath
- Logging: all server actions log to Axiom backend dataset
- Errors: Sentry + Axiom, pages use safeFetch() helper for error-safe data loading

## Auth Flow
1. User registers/logs in → Supabase Auth
2. Middleware refreshes session on every request
3. Layout components check auth + role
4. Server actions verify auth before mutations

## Roles
- Student: green accent (#58CC02), /student/*
- Professor: blue accent (#1CB0F6), /professor/*
- Admin: red accent (#FF4B4B), /admin/*
