# CODEMAP -- apps/api

Express 5 REST API for the IIIT Kalyani LMS.

## Entry Point

- `src/index.ts` -- App bootstrap: registers middleware, mounts all routers, serves Swagger UI, handles graceful shutdown

## config/

- `src/config/cloudinary.ts` -- Configures and exports the Cloudinary v2 client
- `src/config/cors.ts` -- CORS options allowing frontend URL, localhost, and *.vercel.app origins
- `src/config/env.ts` -- Validates all environment variables with Zod; throws on startup if invalid
- `src/config/swagger.ts` -- Generates OpenAPI 3.0 spec via swagger-jsdoc, scanning route files for annotations

## db/

- `src/db/supabase.ts` -- Creates admin Supabase client with service-role key (bypasses RLS)

## middleware/

- `src/middleware/auth.ts` -- Extracts and verifies JWT from Authorization header, attaches AuthPayload to req.user
- `src/middleware/error-handler.ts` -- Global error handler: structured JSON for AppError subclasses, 500 for unhandled
- `src/middleware/rate-limit.ts` -- Rate limiters: authLimiter (10 req/min), apiLimiter (100 req/min)
- `src/middleware/request-logger.ts` -- Logs method, path, status, duration, and userId for every request
- `src/middleware/roles.ts` -- Role-based auth middleware factory (requireStudent, requireProfessor, requireAdmin)

## routes/

- `src/routes/auth.ts` -- POST register (domain-restricted), login, token refresh, logout
- `src/routes/courses.ts` -- GET all courses, GET course by slug, GET course with full module tree
- `src/routes/enrollments.ts` -- GET user enrollments, POST enroll in course, GET lesson completions
- `src/routes/lessons.ts` -- GET lesson content, GET flashcard deck, POST mark lesson completed
- `src/routes/quizzes.ts` -- GET quiz with questions, POST submit quiz attempt
- `src/routes/assignments.ts` -- GET assignment with user submission, POST submit assignment code
- `src/routes/projects.ts` -- GET project with user submission, POST submit project code
- `src/routes/submissions.ts` -- GET all user submissions, POST grade a submission (professor/admin)
- `src/routes/gamification.ts` -- GET leaderboard, GET achievements, GET streak, GET weekly XP
- `src/routes/profile.ts` -- GET full profile (stats, streaks, enrollments), PATCH update display name
- `src/routes/upload.ts` -- POST upload file to Cloudinary, POST attach file URL to submission

## routes/admin/

- `src/routes/admin/achievements.ts` -- GET all achievements, POST create achievement
- `src/routes/admin/analytics.ts` -- GET XP audit log, GET analytics (user growth, enrollment distribution)
- `src/routes/admin/courses.ts` -- GET courses with enrollment counts, POST create, DELETE, PATCH assign instructor
- `src/routes/admin/stats.ts` -- GET aggregate system statistics (users, courses, lessons, submissions, XP)
- `src/routes/admin/users.ts` -- GET paginated users (search/filter), GET professors, GET user detail, PATCH role, DELETE user

## routes/professor/

- `src/routes/professor/content.ts` -- Full CRUD for modules, lessons, quizzes, questions, assignments, and projects
- `src/routes/professor/dashboard.ts` -- GET class statistics (enrollment counts, completion rates)
- `src/routes/professor/grading.ts` -- GET pending submissions, GET recently graded submissions
- `src/routes/professor/students.ts` -- GET paginated student roster with search, GET student detail view

## services/

- `src/services/auth.service.ts` -- Register (creates user + profile + stats, signs JWTs), login, refresh tokens
- `src/services/course.service.ts` -- Fetch all courses, fetch by slug, fetch with nested module tree
- `src/services/enrollment.service.ts` -- Fetch enrollments, fetch completions, enroll with duplicate checks
- `src/services/gamification.service.ts` -- Leaderboard, achievements with progress, streaks, weekly XP, unlock checking
- `src/services/lesson.service.ts` -- Lesson content, flashcards, mark complete (XP transaction, stats update, streak upsert)
- `src/services/professor.service.ts` -- Class stats, student roster, student detail, pending/graded submissions
- `src/services/profile.service.ts` -- Full profile fetch (profile, stats, streak, enrollments, lessons), update name
- `src/services/quiz.service.ts` -- Fetch quiz, submit attempt (calculate XP from score, log transaction, update stats)
- `src/services/streak.service.ts` -- Recalculate current and longest streak from streak log, update user_stats
- `src/services/submission.service.ts` -- Fetch/submit assignments and projects, fetch all submissions, grade with XP award
- `src/services/upload.service.ts` -- Stream file buffer to Cloudinary, attach file URL to submission record

## services/admin/

- `src/services/admin/achievements.ts` -- Fetch all achievements, insert new achievement
- `src/services/admin/analytics.ts` -- System stats, XP audit log, analytics (monthly growth, enrollment distribution, top students)
- `src/services/admin/courses.ts` -- Courses with enrollment counts, create/delete course, assign instructor
- `src/services/admin/users.ts` -- Paginated user list, user detail, update role, delete user, list professors

## services/content/

- `src/services/content/index.ts` -- Barrel: fetches full course content (modules with nested items), re-exports CRUD
- `src/services/content/modules.ts` -- Create, update, delete modules
- `src/services/content/lessons.ts` -- Create, update, delete lessons (with structured content sections)
- `src/services/content/quizzes.ts` -- Create/update/delete quizzes and quiz questions
- `src/services/content/assignments.ts` -- Create, update, delete assignments
- `src/services/content/projects.ts` -- Create, update, delete projects

## utils/

- `src/utils/errors.ts` -- AppError hierarchy: BadRequest (400), Unauthorized (401), Forbidden (403), NotFound (404), Conflict (409), RateLimit (429)
- `src/utils/logger.ts` -- Structured logger with batch flush to Axiom (5s interval or 50-entry cap)
- `src/utils/pagination.ts` -- parsePagination (clamp page/limit), paginate (wrap in PaginatedResponse envelope)
