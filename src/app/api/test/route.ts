import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// TODO: Set SUPABASE_SERVICE_ROLE_KEY in environment variables for this route to work.
// The service role key is required for admin operations like creating users and
// managing test data. Without it, all actions will return a 500 error.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

const E2E_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "e2e_test_pass_123";

const E2E_ACCOUNTS = [
  {
    email: "e2e_student@iiitkalyani.ac.in",
    password: process.env.E2E_STUDENT_PASSWORD ?? E2E_PASSWORD,
    role: "student",
    fullName: "E2E Test Student",
  },
  {
    email: "e2e_professor@iiitkalyani.ac.in",
    password: process.env.E2E_PROFESSOR_PASSWORD ?? E2E_PASSWORD,
    role: "professor",
    fullName: "E2E Test Professor",
  },
  {
    email: "e2e_admin@iiitkalyani.ac.in",
    password: process.env.E2E_ADMIN_PASSWORD ?? E2E_PASSWORD,
    role: "admin",
    fullName: "E2E Test Admin",
  },
];

/**
 * @openapi
 * /api/test:
 *   post:
 *     summary: E2E test data management
 *     description: >
 *       Manages test accounts and data seeding for E2E tests.
 *       Only available in non-production environments (or when E2E_MODE is set).
 *       Requires SUPABASE_SERVICE_ROLE_KEY to be configured.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [ensure-e2e-accounts, seed-baseline, cleanup-all, resolve-test-entities]
 *                 description: |
 *                   - ensure-e2e-accounts: Creates student/professor/admin test accounts if they don't exist
 *                   - seed-baseline: Enrolls test student in all courses, creates sample completions and quiz attempts
 *                   - cleanup-all: Removes all e2e_* user data from lesson_completions, quiz_attempts, submissions, enrollments
 *                   - resolve-test-entities: Returns IDs and roles of all e2e_* test accounts
 *     responses:
 *       200:
 *         description: Action completed successfully. Response shape varies by action.
 *       400:
 *         description: Unknown action or missing prerequisites (e.g., accounts not seeded yet)
 *       403:
 *         description: Not available in production (NODE_ENV=production without E2E_MODE)
 *       500:
 *         description: SUPABASE_SERVICE_ROLE_KEY not configured
 */
export async function POST(request: NextRequest) {
  // Only allow in development/test environments
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.E2E_MODE
  ) {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  const supabaseAdmin = getAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is not configured. Set it in your environment variables.",
      },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { action } = body;

  switch (action) {
    case "ensure-e2e-accounts": {
      const results = [];

      for (const account of E2E_ACCOUNTS) {
        // Check if user already exists by listing users with email filter
        const { data: existingUsers } =
          await supabaseAdmin.auth.admin.listUsers();
        const existing = existingUsers?.users?.find(
          (u) => u.email === account.email
        );

        if (existing) {
          results.push({
            email: account.email,
            status: "already_exists",
            id: existing.id,
          });
          continue;
        }

        // Create the user with the specified role in metadata
        const { data, error } =
          await supabaseAdmin.auth.admin.createUser({
            email: account.email,
            password: account.password,
            email_confirm: true,
            user_metadata: {
              full_name: account.fullName,
              username: account.email.split("@")[0],
              role: account.role,
            },
          });

        if (error) {
          results.push({
            email: account.email,
            status: "error",
            error: error.message,
          });
        } else {
          results.push({
            email: account.email,
            status: "created",
            id: data.user.id,
          });
        }
      }

      return NextResponse.json({ results });
    }

    case "seed-baseline": {
      // Find the e2e_student user
      const { data: allUsers } =
        await supabaseAdmin.auth.admin.listUsers();
      const studentUser = allUsers?.users?.find(
        (u) => u.email === "e2e_student@iiitkalyani.ac.in"
      );

      if (!studentUser) {
        return NextResponse.json(
          { error: "e2e_student not found. Run ensure-e2e-accounts first." },
          { status: 400 }
        );
      }

      const studentId = studentUser.id;

      // 1. Get all courses
      const { data: courses } = await supabaseAdmin
        .from("courses")
        .select("id")
        .order("title");

      if (!courses || courses.length === 0) {
        return NextResponse.json(
          { error: "No courses found in the database." },
          { status: 400 }
        );
      }

      // 2. Enroll e2e_student in all courses
      const enrollmentRows = courses.map((c: { id: string }) => ({
        user_id: studentId,
        course_id: c.id,
      }));

      const { error: enrollError } = await supabaseAdmin
        .from("enrollments")
        .upsert(enrollmentRows, { onConflict: "user_id,course_id" });

      // 3. Create a few lesson completions (first 3 lessons from the first course)
      const { data: lessons } = await supabaseAdmin
        .from("lessons")
        .select("id, course_id, xp_reward")
        .eq("course_id", courses[0].id)
        .order("order")
        .limit(3);

      let lessonCompletions = 0;
      if (lessons && lessons.length > 0) {
        const completionRows = lessons.map((l: { id: string; course_id: string; xp_reward: number }) => ({
          user_id: studentId,
          lesson_id: l.id,
          course_id: l.course_id,
          xp_earned: l.xp_reward ?? 50,
        }));

        const { error: lcError } = await supabaseAdmin
          .from("lesson_completions")
          .upsert(completionRows, { onConflict: "user_id,lesson_id" });

        if (!lcError) lessonCompletions = completionRows.length;
      }

      // 4. Create a quiz attempt (first quiz from the first course)
      const { data: quizzes } = await supabaseAdmin
        .from("quizzes")
        .select("id, xp_reward")
        .eq("course_id", courses[0].id)
        .limit(1);

      let quizAttempts = 0;
      if (quizzes && quizzes.length > 0) {
        const quiz = quizzes[0];
        const { error: qaError } = await supabaseAdmin
          .from("quiz_attempts")
          .insert({
            user_id: studentId,
            quiz_id: quiz.id,
            score: 80,
            answers: {},
            xp_earned: Math.round(((quiz.xp_reward ?? 50) * 80) / 100),
            completed_at: new Date().toISOString(),
            time_spent_seconds: 120,
          });

        if (!qaError) quizAttempts = 1;
      }

      return NextResponse.json({
        status: "seeded",
        studentId,
        enrollments: enrollmentRows.length,
        enrollError: enrollError?.message ?? null,
        lessonCompletions,
        quizAttempts,
      });
    }

    case "cleanup-all": {
      // Delete all e2e_* prefixed test data
      // Query for users whose email starts with e2e_
      const { data: users } =
        await supabaseAdmin.auth.admin.listUsers();
      const e2eUsers = users?.users?.filter((u) =>
        u.email?.startsWith("e2e_")
      );
      const e2eUserIds = e2eUsers?.map((u) => u.id) ?? [];

      const cleanupResults: Record<string, string> = {};

      if (e2eUserIds.length > 0) {
        // Clean up related data tables
        // TODO: Add cleanup for each table as schema evolves
        const tables = [
          "lesson_completions",
          "quiz_attempts",
          "submissions",
          "enrollments",
        ];

        for (const table of tables) {
          const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .in("user_id", e2eUserIds);
          cleanupResults[table] = error
            ? `error: ${error.message}`
            : "cleaned";
        }
      }

      return NextResponse.json({
        e2eUsersFound: e2eUserIds.length,
        cleanupResults,
      });
    }

    case "resolve-test-entities": {
      const { data: users } =
        await supabaseAdmin.auth.admin.listUsers();
      const e2eUsers = users?.users?.filter((u) =>
        u.email?.startsWith("e2e_")
      );

      const entities =
        e2eUsers?.map((u) => ({
          id: u.id,
          email: u.email,
          role: u.user_metadata?.role,
        })) ?? [];

      return NextResponse.json({ entities });
    }

    default:
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 }
      );
  }
}
