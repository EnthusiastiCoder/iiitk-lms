# CODEMAP -- apps/web

Next.js 16 frontend for the IIIT Kalyani LMS. App Router with Server Components.

## Entry / Global

- `src/app/layout.tsx` -- Root layout: ThemeProvider (next-themes), TooltipProvider, global CSS
- `src/app/page.tsx` -- Root page: redirects to /student
- `src/app/not-found.tsx` -- Custom 404 page
- `src/app/sitemap.ts` -- SEO sitemap (login, register)
- `src/app/globals.css` -- Tailwind CSS v4 global styles and theme variables
- `src/middleware.ts` -- Route guard: redirects unauthenticated users to /auth/login

## app/(auth)/ -- Authentication

- `layout.tsx` -- Centered dark auth layout with IIIT Kalyani branding
- `error.tsx` -- Auth error boundary
- `loading.tsx` -- Auth loading spinner
- `auth/login/page.tsx` -- Email/password login form with redirect support
- `auth/register/page.tsx` -- Registration form (name, email, password, role selection)
- `auth/callback/route.ts` -- OAuth redirect stub (redirects to login)
- `auth/confirm/route.ts` -- Email confirmation redirect (redirects to login)

## app/(student)/ -- Student Portal

- `layout.tsx` -- Student shell: sidebar, mobile nav, grading notifier, toast container
- `error.tsx` -- Student error boundary
- `loading.tsx` -- Student loading spinner
- `student/courses/page.tsx` -- Course catalog with enrollment status and progress
- `student/courses/[courseSlug]/page.tsx` -- Course detail with module tree, enrollment, and progress
- `student/courses/[courseSlug]/assignment/[assignmentId]/page.tsx` -- Assignment submission with code editor
- `student/courses/[courseSlug]/project/[projectId]/page.tsx` -- Project submission with code editor
- `student/achievements/page.tsx` -- Achievement gallery with unlock status and progress
- `student/leaderboard/page.tsx` -- XP leaderboard with rank highlighting
- `student/practice/page.tsx` -- Practice quizzes listing
- `student/profile/page.tsx` -- Profile view with stats, streaks, activity heatmap
- `student/submissions/page.tsx` -- Submission history with status tabs

## app/(professor)/ -- Professor Portal

- `layout.tsx` -- Professor shell: sidebar, mobile nav
- `error.tsx` -- Professor error boundary
- `loading.tsx` -- Professor loading spinner
- `professor/page.tsx` -- Professor dashboard with class stats
- `professor/courses/page.tsx` -- Course management grid
- `professor/courses/[courseSlug]/page.tsx` -- Course content management (modules, lessons, quizzes, assignments, projects)
- `professor/grading/page.tsx` -- Grading center with pending and graded submissions
- `professor/profile/page.tsx` -- Professor profile page
- `professor/students/page.tsx` -- Student roster with search
- `professor/students/[studentId]/page.tsx` -- Student detail (progress, grades, activity)

## app/(admin)/ -- Admin Panel

- `layout.tsx` -- Admin shell: sidebar, mobile nav
- `error.tsx` -- Admin error boundary
- `loading.tsx` -- Admin loading spinner
- `admin/page.tsx` -- Admin dashboard with system stats
- `admin/achievements/page.tsx` -- Achievement management
- `admin/analytics/page.tsx` -- System analytics (user growth, enrollment distribution)
- `admin/courses/page.tsx` -- Course administration
- `admin/users/page.tsx` -- User management with search, role filter, actions

## app/api/ -- Next.js API Routes

- `api/test/route.ts` -- E2E test data seeding endpoint (Supabase admin operations)

## components/admin/

- `AdminMobileNav.tsx` -- Mobile hamburger nav for admin portal
- `AdminSidebar.tsx` -- Desktop sidebar for admin portal
- `CreateAchievementDialog.tsx` -- Dialog form to create a new achievement
- `CreateCourseDialog.tsx` -- Dialog form to create a new course
- `UserActions.tsx` -- User row action buttons (role change, delete)
- `UserSearch.tsx` -- Search input for filtering user list

## components/courses/

- `CoursesCatalog.tsx` -- Course card grid with enrollment status and progress bars
- `CourseModules.tsx` -- Expandable module tree with lessons, quizzes, assignments, projects
- `EnrollButton.tsx` -- Enroll/unenroll button with optimistic UI
- `LessonSidebar.tsx` -- Lesson navigation sidebar within a course
- `LessonViewer.tsx` -- Lesson content renderer with section-by-section display
- `SectionRenderer.tsx` -- Renders individual content sections (text, code, image, video)

## components/dashboard/

- `StatsGrid.tsx` -- Grid of stat cards (XP, level, streak, courses)
- `WeeklyXpChart.tsx` -- Bar chart showing XP earned per day of the week
- `WelcomeBanner.tsx` -- Greeting banner with user name and tier badge

## components/editor/

- `CodeEditor.tsx` -- CodeMirror editor with JS/Python syntax and one-dark theme

## components/flashcard/

- `FlashcardDeck.tsx` -- Interactive flashcard deck with flip animation

## components/layout/

- `MobileNav.tsx` -- Student mobile hamburger navigation
- `StudentSidebar.tsx` -- Student desktop sidebar with nav links and tier badge

## components/motion/

- `fade-in.tsx` -- Motion (framer-motion) fade-in animation wrapper

## components/professor/

- `CreateAssignmentDialog.tsx` -- Dialog to create assignment with difficulty/language/starter code
- `CreateLessonDialog.tsx` -- Dialog to create lesson with content sections
- `CreateModuleDialog.tsx` -- Dialog to create a course module
- `CreateProjectDialog.tsx` -- Dialog to create project with expected output
- `CreateQuizDialog.tsx` -- Dialog to create quiz with time limit
- `DeleteConfirmDialog.tsx` -- Generic confirmation dialog for deletions
- `EditAssignmentDialog.tsx` -- Dialog to edit an existing assignment
- `EditLessonDialog.tsx` -- Dialog to edit an existing lesson
- `EditModuleDialog.tsx` -- Dialog to edit an existing module
- `EditProjectDialog.tsx` -- Dialog to edit an existing project
- `EditQuizDialog.tsx` -- Dialog to edit an existing quiz
- `GradeDialog.tsx` -- Dialog to grade a student submission with score and feedback
- `ProfessorMobileNav.tsx` -- Mobile hamburger nav for professor portal
- `ProfessorSidebar.tsx` -- Desktop sidebar for professor portal
- `StudentSearch.tsx` -- Search input for filtering student roster

## components/profile/

- `ActivityHeatmap.tsx` -- GitHub-style activity heatmap showing daily streak data
- `ProfileEditor.tsx` -- Inline editor for updating display name

## components/quiz/

- `QuizQuestion.tsx` -- Single quiz question with multiple-choice options
- `QuizResults.tsx` -- Quiz attempt results with score and XP earned
- `QuizTaker.tsx` -- Full quiz-taking flow (questions, timer, submission)
- `QuizTimer.tsx` -- Countdown timer for timed quizzes

## components/realtime/

- `GradingNotifier.tsx` -- Supabase Realtime listener for grading notifications

## components/submissions/

- `CodeSubmission.tsx` -- Code editor + submit flow for assignments and projects
- `FileUploader.tsx` -- Drag-and-drop file upload to Cloudinary
- `SubmissionStatus.tsx` -- Badge showing submission grading status

## components/ui/ (shadcn/ui primitives)

- `accordion.tsx` -- Collapsible accordion
- `avatar.tsx` -- User avatar with fallback
- `badge.tsx` -- Status/label badge
- `button.tsx` -- Button with variants (default, outline, ghost, etc.)
- `card.tsx` -- Card container with header/content/footer
- `dialog.tsx` -- Modal dialog
- `input.tsx` -- Text input
- `progress.tsx` -- Progress bar
- `scroll-area.tsx` -- Custom scrollable area
- `select.tsx` -- Dropdown select
- `separator.tsx` -- Horizontal/vertical separator
- `sheet.tsx` -- Slide-out panel
- `tabs.tsx` -- Tab navigation
- `textarea.tsx` -- Multi-line text input
- `toast-notification.tsx` -- Toast notification system
- `tooltip.tsx` -- Hover tooltip

## lib/

- `src/lib/api.ts` -- Client-side API helper: typed fetch wrappers for all endpoints, token management
- `src/lib/server-api.ts` -- Server-side API helper: reads JWT from cookies, fetches from API with auth
- `src/lib/server-mutations.ts` -- Server Actions for mutations (enroll, delete, etc.) with revalidation
- `src/lib/tiers.ts` -- Tier configuration (bronze, silver, gold, diamond) with colors and labels
- `src/lib/utils.ts` -- Utility: cn() for merging Tailwind classes (clsx + tailwind-merge)
