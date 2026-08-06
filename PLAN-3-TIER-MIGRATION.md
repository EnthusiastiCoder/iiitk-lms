# 3-Tier Architecture Migration Plan

## Current State
Next.js monolith where Server Actions call Supabase directly. No API layer.
- 62+ server action functions across 12 files
- 7 pages query Supabase directly in component body
- 3 layouts query Supabase for auth/role checks
- 2 client components use Supabase (Storage uploads, Realtime subscriptions)
- Auth entirely through Supabase Auth SDK

## Target Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Next.js (Web)  │────▶│  Express.js API  │────▶│   Supabase   │
│    Vercel       │     │    Render         │     │  (Postgres)  │
│                 │     │                   │     └──────────────┘
│  - SSR pages    │     │  - REST endpoints │
│  - React UI     │     │  - Auth (JWT)     │     ┌──────────────┐
│  - No DB calls  │     │  - Business logic │────▶│  Cloudinary  │
│                 │     │  - File uploads   │     │  (Storage)   │
└─────────────────┘     └──────────────────┘     └──────────────┘
```

**Frontend** (Next.js on Vercel): Presentation layer only. SSR pages fetch from Express API. No Supabase imports.
**Backend** (Express.js on Render): All business logic, auth, DB access, file uploads. RESTful JSON API.
**Database** (Supabase): Postgres only. No Auth SDK, no Storage, no Realtime from frontend.
**Storage** (Cloudinary): File uploads for assignment/project submissions.

## Monorepo Structure

```
LMSIIITK/
├── apps/
│   ├── api/                          # Express.js backend
│   │   ├── src/
│   │   │   ├── index.ts              # Entry point, Express app setup
│   │   │   ├── config/
│   │   │   │   ├── env.ts            # Environment validation
│   │   │   │   ├── cors.ts           # CORS config (allow Vercel origin)
│   │   │   │   └── cloudinary.ts     # Cloudinary SDK config
│   │   │   ├── db/
│   │   │   │   └── supabase.ts       # Single Supabase admin client (service role)
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           # JWT verification middleware
│   │   │   │   ├── roles.ts          # Role guard middleware (student, professor, admin)
│   │   │   │   ├── rate-limit.ts     # Rate limiting
│   │   │   │   ├── logger.ts         # Request logging (Axiom)
│   │   │   │   └── error-handler.ts  # Global error handler
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts           # POST /auth/register, /auth/login, /auth/logout, /auth/refresh
│   │   │   │   ├── courses.ts        # GET /courses, /courses/:slug, /courses/:slug/full
│   │   │   │   ├── enrollments.ts    # GET /enrollments, POST /enrollments
│   │   │   │   ├── lessons.ts        # GET /lessons/:id, /lessons/:id/flashcards, POST /lessons/:id/complete
│   │   │   │   ├── quizzes.ts        # GET /quizzes/:id, POST /quizzes/:id/attempt
│   │   │   │   ├── assignments.ts    # GET /assignments/:id, POST /assignments/:id/submit
│   │   │   │   ├── projects.ts       # GET /projects/:id, POST /projects/:id/submit
│   │   │   │   ├── submissions.ts    # GET /submissions, POST /submissions/:id/grade
│   │   │   │   ├── gamification.ts   # GET /leaderboard, /achievements, /streaks, /weekly-xp
│   │   │   │   ├── profile.ts        # GET /profile, PATCH /profile
│   │   │   │   ├── upload.ts         # POST /upload (Cloudinary)
│   │   │   │   ├── admin/
│   │   │   │   │   ├── users.ts      # GET /admin/users, /admin/users/:id, PATCH, DELETE
│   │   │   │   │   ├── courses.ts    # GET /admin/courses, POST, DELETE, PATCH /admin/courses/:id/instructor
│   │   │   │   │   ├── achievements.ts # GET /admin/achievements, POST
│   │   │   │   │   ├── analytics.ts  # GET /admin/analytics, /admin/audit-log
│   │   │   │   │   └── stats.ts      # GET /admin/stats
│   │   │   │   └── professor/
│   │   │   │       ├── dashboard.ts  # GET /professor/stats
│   │   │   │       ├── students.ts   # GET /professor/students, /professor/students/:id
│   │   │   │       ├── grading.ts    # GET /professor/pending, /professor/graded
│   │   │   │       └── content.ts    # CRUD /professor/courses/:slug/modules, lessons, quizzes, assignments, projects
│   │   │   ├── services/             # Business logic (extracted from server actions)
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── course.service.ts
│   │   │   │   ├── lesson.service.ts
│   │   │   │   ├── quiz.service.ts
│   │   │   │   ├── submission.service.ts
│   │   │   │   ├── gamification.service.ts
│   │   │   │   ├── achievement.service.ts
│   │   │   │   ├── streak.service.ts
│   │   │   │   ├── upload.service.ts
│   │   │   │   ├── admin.service.ts
│   │   │   │   └── professor.service.ts
│   │   │   └── utils/
│   │   │       ├── logger.ts         # Class-based Axiom logger (port from existing)
│   │   │       ├── errors.ts         # AppError classes (400, 401, 403, 404)
│   │   │       └── pagination.ts     # Pagination helpers
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── web/                          # Next.js frontend (moved from root)
│       ├── src/
│       │   ├── lib/
│       │   │   └── api.ts            # API client (fetch wrapper with auth headers)
│       │   ├── app/                  # Same route structure, but pages call API client instead of Supabase
│       │   ├── components/           # Same components, no Supabase imports
│       │   └── types/                # Shared types (imported from packages/shared)
│       ├── package.json
│       ├── next.config.ts
│       └── .env.example
│
├── packages/
│   └── shared/                       # Shared TypeScript types
│       ├── src/
│       │   ├── types.ts              # All domain interfaces (Profile, Course, etc.)
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                      # Root workspace config
├── turbo.json                        # Turborepo config (optional)
└── .gitignore
```

## REST API Endpoints

### Auth (no auth required)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| POST | `/auth/register` | Register with email/password/role | `auth.ts → register()` |
| POST | `/auth/login` | Login, returns JWT + refresh token | `auth.ts → login()` |
| POST | `/auth/logout` | Invalidate session | `auth.ts → logout()` |
| POST | `/auth/refresh` | Refresh JWT using refresh token | New (middleware handled this) |

### Courses (auth required)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| GET | `/courses` | List all courses | `courses.ts → getCourses()` |
| GET | `/courses/:slug` | Single course by slug | `courses.ts → getCourseBySlug()` |
| GET | `/courses/:slug/full` | Course + modules + lessons + quizzes + assignments + projects | `courses.ts → getCourseWithModules()` |

### Enrollments (auth required, student)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| GET | `/enrollments` | User's enrollments | `courses.ts → getUserEnrollments()` |
| POST | `/enrollments` | Enroll in a course `{courseId}` | `courses.ts → enrollInCourse()` |
| GET | `/completions` | User's lesson completions | `courses.ts → getUserCompletions()` |

### Lessons (auth required)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| GET | `/lessons/:id` | Lesson content | `lessons.ts → getLessonContent()` |
| GET | `/lessons/:id/flashcards` | Flashcard deck | `lessons.ts → getFlashcardDeck()` |
| POST | `/lessons/:id/complete` | Mark complete + XP + streak + achievements | `lessons.ts → completeLesson()` |

### Quizzes (auth required)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| GET | `/quizzes/:id` | Quiz with questions | Direct Supabase in page |
| POST | `/quizzes/:id/attempt` | Submit quiz attempt | `submissions.ts → submitQuizAttempt()` |

### Assignments & Projects (auth required)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| GET | `/assignments/:id` | Assignment detail + user's submission | Direct Supabase in page |
| POST | `/assignments/:id/submit` | Submit assignment | `submissions.ts → submitAssignment()` |
| GET | `/projects/:id` | Project detail + user's submission | Direct Supabase in page |
| POST | `/projects/:id/submit` | Submit project | `submissions.ts → submitProject()` |

### Submissions (auth required)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| GET | `/submissions` | User's all submissions | `submissions.ts → getUserSubmissions()` |
| POST | `/submissions/:id/grade` | Grade a submission (professor) | `submissions.ts → gradeSubmission()` |

### Gamification (auth required)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| GET | `/leaderboard` | Top 50 by XP | `gamification.ts → getLeaderboard()` |
| GET | `/achievements` | All achievements + user progress | `gamification.ts → getUserAchievements()` |
| GET | `/streaks` | Last 30 days streak data | `gamification.ts → getStreakData()` |
| GET | `/weekly-xp` | Weekly XP breakdown | `gamification.ts → getWeeklyXp()` |

### Profile (auth required)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| GET | `/profile` | Full profile + stats + streak data | Direct Supabase in page |
| PATCH | `/profile` | Update name | `profile.ts → updateProfile()` |

### Upload (auth required)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| POST | `/upload` | Upload file to Cloudinary, return URL | `upload.ts` (currently Supabase Storage) |
| POST | `/upload/attach` | Attach file URL to submission | `upload.ts → addFileToSubmission()` |

### Professor (professor/admin role required)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| GET | `/professor/stats` | Class stats | `professor.ts → getClassStats()` |
| GET | `/professor/students` | Student roster (paginated, searchable) | `professor.ts → getStudentRoster()` |
| GET | `/professor/students/:id` | Student detail | `professor.ts → getStudentDetail()` |
| GET | `/professor/pending` | Pending submissions | `professor.ts → getPendingSubmissions()` |
| GET | `/professor/graded` | Recent graded submissions | `professor.ts → getRecentGraded()` |
| GET | `/professor/courses/:slug/content` | Course content for management | `content → getCourseContentForProfessor()` |
| POST | `/professor/courses/:slug/modules` | Create module | `content → createModule()` |
| PATCH | `/professor/modules/:id` | Update module | `content → updateModule()` |
| DELETE | `/professor/modules/:id` | Delete module | `content → deleteModule()` |
| POST | `/professor/modules/:id/lessons` | Create lesson | `content → createLesson()` |
| PATCH | `/professor/lessons/:id` | Update lesson | `content → updateLesson()` |
| DELETE | `/professor/lessons/:id` | Delete lesson | `content → deleteLesson()` |
| POST | `/professor/modules/:id/quizzes` | Create quiz | `content → createQuiz()` |
| POST | `/professor/quizzes/:id/questions` | Create quiz question | `content → createQuizQuestion()` |
| PATCH | `/professor/quizzes/:id` | Update quiz | `content → updateQuiz()` |
| PATCH | `/professor/questions/:id` | Update quiz question | `content → updateQuizQuestion()` |
| DELETE | `/professor/quizzes/:id` | Delete quiz | `content → deleteQuiz()` |
| POST | `/professor/modules/:id/assignments` | Create assignment | `content → createAssignment()` |
| PATCH | `/professor/assignments/:id` | Update assignment | `content → updateAssignment()` |
| DELETE | `/professor/assignments/:id` | Delete assignment | `content → deleteAssignment()` |
| POST | `/professor/modules/:id/projects` | Create project | `content → createProject()` |
| PATCH | `/professor/projects/:id` | Update project | `content → updateProject()` |
| DELETE | `/professor/projects/:id` | Delete project | `content → deleteProject()` |

### Admin (admin role required)
| Method | Endpoint | Description | Current Source |
|--------|----------|-------------|----------------|
| GET | `/admin/stats` | System-wide stats | `admin.ts → getSystemStats()` |
| GET | `/admin/users` | Paginated user list with search/filter | `admin.ts → getUserList()` |
| GET | `/admin/users/:id` | User detail | `admin.ts → getUserById()` |
| PATCH | `/admin/users/:id/role` | Change user role | `admin.ts → updateUserRole()` |
| DELETE | `/admin/users/:id` | Delete user | `admin.ts → deleteUser()` |
| GET | `/admin/courses` | All courses with enrollments | `admin.ts → getAllCourses()` |
| POST | `/admin/courses` | Create course | `admin.ts → createCourse()` |
| DELETE | `/admin/courses/:id` | Delete course | `admin.ts → deleteCourse()` |
| PATCH | `/admin/courses/:id/instructor` | Assign instructor | `admin.ts → assignInstructor()` |
| GET | `/admin/achievements` | All achievements | `admin.ts → getAllAchievements()` |
| POST | `/admin/achievements` | Create achievement | `admin.ts → createAchievement()` |
| GET | `/admin/audit-log` | Recent XP transactions | `admin.ts → getAuditLog()` |
| GET | `/admin/professors` | List professors | `admin.ts → getProfessorList()` |
| GET | `/admin/analytics` | Analytics data | `admin.ts → getAnalyticsData()` |

**Total: 68 endpoints**

## Auth Design (Express-Managed)

### How It Works
1. **Register**: Express receives email/password/role → creates user in Supabase Auth via admin API → creates profile row → returns JWT
2. **Login**: Express receives email/password → validates via Supabase Auth `signInWithPassword` → returns JWT + refresh token
3. **JWT**: Express signs its own JWTs (or uses Supabase JWTs). Frontend stores in httpOnly cookie or Authorization header.
4. **Middleware**: Every API request → `auth` middleware extracts JWT → verifies → attaches `req.user` with userId and role
5. **Role Guards**: `requireStudent()`, `requireProfessor()`, `requireAdmin()` middleware check `req.user.role`
6. **Refresh**: Frontend calls `/auth/refresh` with refresh token → Express returns new JWT
7. **Logout**: Express invalidates session via Supabase Auth `signOut`

### Frontend Auth Flow
1. Login/Register pages POST to Express API
2. Express returns JWT in response body (or sets httpOnly cookie)
3. Frontend stores JWT and includes in all subsequent API calls via `Authorization: Bearer <token>` header
4. Next.js middleware reads the JWT cookie to determine auth state for SSR route protection
5. No Supabase SDK on the frontend at all

## Realtime Replacement

Currently `GradingNotifier.tsx` uses Supabase Realtime (postgres_changes). Options:
1. **Polling**: Frontend polls `/submissions?status=graded&since=<timestamp>` every 30s. Simplest.
2. **SSE (Server-Sent Events)**: Express endpoint streams grading events. More efficient.
3. **Keep Supabase Realtime**: Use it server-side in Express, forward via SSE/WebSocket to frontend.

**Decision: Polling** — simplest for a college project. 30-second interval is fine for grading notifications.

## Migration Phases (Commit Plan)

### Phase 1: Monorepo Setup (5 commits)
1. Initialize monorepo workspace structure, move Next.js to `apps/web/`
2. Create `packages/shared/` with all domain types
3. Create `apps/api/` Express scaffold (entry point, config, middleware skeleton)
4. Add Supabase client in `apps/api/src/db/supabase.ts` (service role)
5. Add Cloudinary config in `apps/api/src/config/cloudinary.ts`

### Phase 2: Auth System (4 commits)
6. Build auth service (register, login, logout, refresh)
7. Build auth middleware (JWT verification, user extraction)
8. Build role guard middleware (requireStudent, requireProfessor, requireAdmin)
9. Build rate limiting middleware

### Phase 3: Core API Routes (8 commits)
10. Course routes + service (GET /courses, /courses/:slug, /courses/:slug/full)
11. Enrollment routes + service (GET /enrollments, POST /enrollments, GET /completions)
12. Lesson routes + service (GET /lessons/:id, GET flashcards, POST complete)
13. Quiz routes + service (GET /quizzes/:id, POST attempt)
14. Assignment routes + service (GET, POST submit)
15. Project routes + service (GET, POST submit)
16. Submission routes + service (GET all, POST grade)
17. Upload routes + service (Cloudinary upload, attach to submission)

### Phase 4: Gamification & Profile API (3 commits)
18. Gamification routes (leaderboard, achievements, streaks, weekly-xp)
19. Achievement checking service (checkAndUnlockAchievements, streak update)
20. Profile routes (GET full profile, PATCH update)

### Phase 5: Professor & Admin API (4 commits)
21. Professor dashboard + student routes
22. Professor grading routes (pending, graded)
23. Professor content CRUD routes (modules, lessons, quizzes, assignments, projects)
24. Admin routes (users, courses, achievements, analytics, audit-log, stats)

### Phase 6: Frontend Migration (8 commits)
25. Create API client (`apps/web/src/lib/api.ts`) with auth header injection
26. Replace auth pages (login, register) to POST to Express API
27. Replace all student page data fetching (server actions → API client calls)
28. Replace all professor page data fetching
29. Replace all admin page data fetching
30. Replace layout auth checks (read JWT cookie, call API for profile)
31. Replace file upload component (Cloudinary via Express API)
32. Replace GradingNotifier (Supabase Realtime → polling)

### Phase 7: Cleanup & Deploy (4 commits)
33. Remove all Supabase SDK dependencies from `apps/web/`
34. Remove old `src/actions/` directory, old `src/lib/supabase/` directory
35. Add request logging (Axiom) and error tracking (Sentry) to Express
36. Deploy Express to Render, update Next.js env vars on Vercel

### Phase 8: Testing (3 commits)
37. Update E2E tests for new auth flow (API-based login instead of Supabase)
38. Add API integration tests for critical flows (auth, enrollment, lesson completion, grading)
39. Update CI pipeline for monorepo (build both apps, run both test suites)

**Total: 39 commits**

## Environment Variables

### Express API (`apps/api/.env`)
```
PORT=4000
NODE_ENV=production

# Supabase (DB only)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# JWT
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Axiom (logging)
AXIOM_TOKEN=xxx
AXIOM_DATASET=backend

# Sentry
SENTRY_DSN=xxx

# CORS
FRONTEND_URL=https://iiitklms.vercel.app
```

### Next.js Frontend (`apps/web/.env`)
```
NEXT_PUBLIC_API_URL=https://lms-api.onrender.com
JWT_SECRET=xxx  # Same as API, for middleware to verify JWT in cookies
```

## Code Quality Standards (All Enforced as Lint Errors)

### ESLint Rules (both apps)
| Rule | Value | Rationale |
|------|-------|-----------|
| `max-lines` | 300 | No file exceeds 300 lines. Forces decomposition. |
| `max-lines-per-function` | 75 | Functions stay focused and testable. |
| `max-params` | 4 | Use options objects for complex signatures. |
| `@typescript-eslint/no-explicit-any` | error | Zero `any` types. |
| `no-console` | error (allow warn, error) | Use Logger class, not console. |
| `no-unused-vars` | error | Clean code, no dead references. |
| `import/order` | error | Grouped: builtin → external → internal → relative. |
| `@typescript-eslint/explicit-function-return-type` | error (exported) | All exported functions must declare return types. |
| `max-depth` | 4 | No deeply nested logic. |

### Documentation (in-repo)
| Doc | Location | Description |
|-----|----------|-------------|
| README.md | Root + each app | Setup, usage, architecture overview |
| CODEMAP.md | Root + each app | File-by-file architecture map with responsibility descriptions |
| OpenAPI/Swagger | `apps/api/` | Auto-generated from `swagger-jsdoc` annotations, served at `/api-docs` |
| JSDoc | All exported functions | `@param`, `@returns`, `@throws` on every public function |
| ADR | `docs/adr/` | Architecture Decision Records for major choices |

### Monorepo Tooling
- **Turborepo** for build orchestration, caching, and parallel task execution
- **npm workspaces** for dependency management
- **No service workers / PWA** — never add SW caching (see feedback memory)

### CI Pipeline (.github/workflows/ci.yml)
1. Install dependencies (cached)
2. Lint both apps (`turbo lint`)
3. Type-check both apps (`turbo typecheck`)
4. Build both apps (`turbo build`)
5. Run API integration tests
6. Run E2E tests (Playwright)

## Acceptance Criteria

- [ ] No `@supabase/*` imports in `apps/web/`
- [ ] No direct DB queries in frontend code
- [ ] All 68 API endpoints return correct data
- [ ] Auth flow works: register → login → JWT → authenticated requests
- [ ] Role guards enforce student/professor/admin access
- [ ] File uploads go to Cloudinary via Express
- [ ] Grading notifications work via polling
- [ ] E2E tests pass with new architecture
- [ ] Express deploys on Render, Next.js on Vercel
- [ ] CORS configured correctly (only Vercel origin allowed)
- [ ] Rate limiting on auth endpoints
- [ ] Request logging to Axiom from Express
- [ ] Every file under 300 lines (lint enforced)
- [ ] Every function under 75 lines (lint enforced)
- [ ] Zero `any` types (lint enforced)
- [ ] JSDoc on all exported functions
- [ ] OpenAPI/Swagger at `/api-docs` with all 68 endpoints documented
- [ ] CODEMAP.md for both apps
- [ ] ADR docs for key architectural decisions
- [ ] CI pipeline passes lint + typecheck + build + tests
