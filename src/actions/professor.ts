"use server";

import { createClient } from "@/lib/supabase/server";

export async function getClassStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, accent_color, total_lessons")
    .order("title");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("user_id, course_id");

  const { data: completions } = await supabase
    .from("lesson_completions")
    .select("user_id, course_id, lesson_id");

  const stats = (courses ?? []).map((course: any) => {
    const enrolled = (enrollments ?? []).filter((e: any) => e.course_id === course.id);
    const courseCompletions = (completions ?? []).filter((c: any) => c.course_id === course.id);

    const avgProgress = enrolled.length > 0
      ? Math.round(
          enrolled.reduce((sum: number, e: any) => {
            const studentCompletions = courseCompletions.filter((c: any) => c.user_id === e.user_id).length;
            return sum + (course.total_lessons > 0 ? (studentCompletions / course.total_lessons) * 100 : 0);
          }, 0) / enrolled.length
        )
      : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      courseSlug: course.slug,
      accentColor: course.accent_color,
      enrolled: enrolled.length,
      avgProgress,
      totalLessons: course.total_lessons,
    };
  });

  return stats;
}

export async function getStudentRoster(options?: {
  courseId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const page = options?.page ?? 0;
  const pageSize = options?.pageSize ?? 20;

  let query = supabase
    .from("profiles")
    .select("*, user_stats(*)", { count: "exact" })
    .eq("role", "student")
    .order("full_name")
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (options?.search) {
    query = query.ilike("full_name", `%${options.search}%`);
  }

  const { data, count } = await query;

  let students = data ?? [];

  if (options?.courseId) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("user_id")
      .eq("course_id", options.courseId);

    const enrolledIds = new Set((enrollments ?? []).map((e: any) => e.user_id));
    students = students.filter((s: any) => enrolledIds.has(s.id));
  }

  return { students, total: count ?? 0 };
}

export async function getStudentDetail(studentId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", studentId)
    .single();

  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", studentId)
    .single();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", studentId);

  const { data: completions } = await supabase
    .from("lesson_completions")
    .select("lesson_id, course_id, completed_at")
    .eq("user_id", studentId);

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score, completed_at")
    .eq("user_id", studentId)
    .order("completed_at", { ascending: false });

  return {
    profile,
    stats,
    enrolledCourseIds: (enrollments ?? []).map((e: any) => e.course_id),
    completions: completions ?? [],
    quizAttempts: quizAttempts ?? [],
  };
}

export async function getPendingSubmissions() {
  const supabase = await createClient();

  const [asgn, proj] = await Promise.all([
    supabase
      .from("assignment_submissions")
      .select("*, profiles!assignment_submissions_user_id_fkey(full_name)")
      .eq("status", "pending")
      .order("submitted_at", { ascending: false })
      .limit(50),
    supabase
      .from("project_submissions")
      .select("*, profiles!project_submissions_user_id_fkey(full_name)")
      .eq("status", "pending")
      .order("submitted_at", { ascending: false })
      .limit(50),
  ]);

  return {
    assignments: asgn.data ?? [],
    projects: proj.data ?? [],
  };
}

export async function getRecentGraded() {
  const supabase = await createClient();

  const [asgn, proj] = await Promise.all([
    supabase
      .from("assignment_submissions")
      .select("*, profiles!assignment_submissions_user_id_fkey(full_name)")
      .eq("status", "graded")
      .order("graded_at", { ascending: false })
      .limit(20),
    supabase
      .from("project_submissions")
      .select("*, profiles!project_submissions_user_id_fkey(full_name)")
      .eq("status", "graded")
      .order("graded_at", { ascending: false })
      .limit(20),
  ]);

  return {
    assignments: asgn.data ?? [],
    projects: proj.data ?? [],
  };
}
