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

const E2E_ACCOUNTS = [
  {
    email: "e2e_student@iiitkalyani.ac.in",
    password: "e2e_test_pass_123",
    role: "student",
    fullName: "E2E Test Student",
  },
  {
    email: "e2e_professor@iiitkalyani.ac.in",
    password: "e2e_test_pass_123",
    role: "professor",
    fullName: "E2E Test Professor",
  },
  {
    email: "e2e_admin@iiitkalyani.ac.in",
    password: "e2e_test_pass_123",
    role: "admin",
    fullName: "E2E Test Admin",
  },
];

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
      // TODO: Implement baseline seeding once database schema is finalized
      // This should:
      // - Enroll e2e_student in all available courses
      // - Create some lesson completions for progress tracking
      // - Create quiz attempts with sample scores
      // - Create assignment submissions in various states
      return NextResponse.json({
        message: "Baseline seeding not yet implemented",
        status: "pending",
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
