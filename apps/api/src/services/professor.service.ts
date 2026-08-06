import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";
import { NotFoundError } from "../utils/errors.js";
import { parsePagination, paginate } from "../utils/pagination.js";
import type { PaginatedResponse, Profile } from "@lms/shared";

const logger = new Logger("professor.service");

interface ClassStat {
  id: string;
  title: string;
  slug: string;
  enrollmentCount: number;
  averageCompletion: number;
}

interface StudentRosterOptions {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Get class statistics for a professor's courses.
 * @param userId - The professor's user ID
 * @returns Array of course stats with enrollment counts and average completion
 * @throws Error if database query fails
 */
export async function getClassStats(userId: string): Promise<ClassStat[]> {
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("instructor_id", userId);

  if (error) {
    logger.error("get_class_stats_failed", error, { userId });
    throw error;
  }

  if (!courses || courses.length === 0) return [];

  const stats = await Promise.all(
    courses.map(async (course) => {
      const [enrollRes, completionRes] = await Promise.all([
        supabase
          .from("enrollments")
          .select("id", { count: "exact", head: true })
          .eq("course_id", course.id),
        supabase
          .from("enrollments")
          .select("completed_at")
          .eq("course_id", course.id),
      ]);

      const enrollmentCount = enrollRes.count ?? 0;
      const completions = completionRes.data ?? [];
      const completedCount = completions.filter((e) => e.completed_at).length;
      const averageCompletion =
        enrollmentCount > 0
          ? Math.round((completedCount / enrollmentCount) * 100)
          : 0;

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        enrollmentCount,
        averageCompletion,
      };
    })
  );

  logger.info("class_stats_fetched", { userId, courseCount: stats.length });
  return stats;
}

/**
 * Get a paginated roster of students with optional search.
 * @param options - Pagination and search options
 * @returns Paginated list of student profiles with stats
 * @throws Error if database query fails
 */
export async function getStudentRoster(
  options: StudentRosterOptions
): Promise<PaginatedResponse<Profile & { stats: unknown }>> {
  const { page, limit, offset } = parsePagination(options);

  let query = supabase
    .from("profiles")
    .select("*, user_stats(*)", { count: "exact" })
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.search) {
    query = query.or(
      `full_name.ilike.%${options.search}%,email.ilike.%${options.search}%`
    );
  }

  const { data, count, error } = await query;

  if (error) {
    logger.error("get_student_roster_failed", error);
    throw error;
  }

  const items = (data ?? []).map((row) => {
    const { user_stats, ...profile } = row;
    return { ...profile, stats: user_stats };
  });

  return paginate(items, count ?? 0, { page, limit, offset });
}

/**
 * Get detailed information about a specific student.
 * @param studentId - The student's user ID
 * @returns Student profile, stats, enrollments, completions, and quiz attempts
 * @throws {NotFoundError} If the student is not found
 */
export async function getStudentDetail(studentId: string) {
  const [profileRes, statsRes, enrollRes, completionRes, quizRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", studentId).single(),
      supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", studentId)
        .single(),
      supabase
        .from("enrollments")
        .select("*, courses(title, slug)")
        .eq("user_id", studentId),
      supabase
        .from("lesson_completions")
        .select("*")
        .eq("user_id", studentId)
        .order("completed_at", { ascending: false })
        .limit(50),
      supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", studentId)
        .order("completed_at", { ascending: false })
        .limit(50),
    ]);

  if (!profileRes.data) {
    throw new NotFoundError("Student");
  }

  logger.info("student_detail_fetched", { studentId });

  return {
    profile: profileRes.data,
    stats: statsRes.data,
    enrollments: enrollRes.data ?? [],
    lessonCompletions: completionRes.data ?? [],
    quizAttempts: quizRes.data ?? [],
  };
}

/**
 * Get pending submissions for a professor's courses.
 * @param userId - The professor's user ID
 * @returns Object with pending assignment and project submissions
 * @throws Error if database query fails
 */
export async function getPendingSubmissions(userId: string) {
  const { data: courses } = await supabase
    .from("courses")
    .select("id")
    .eq("instructor_id", userId);

  const courseIds = (courses ?? []).map((c) => c.id);

  if (courseIds.length === 0) {
    return { assignmentSubmissions: [], projectSubmissions: [] };
  }

  const [assignRes, projectRes] = await Promise.all([
    supabase
      .from("assignment_submissions")
      .select("*, profiles!user_id(full_name, email), assignments(title)")
      .in("course_id", courseIds)
      .eq("status", "pending")
      .order("submitted_at", { ascending: false }),
    supabase
      .from("project_submissions")
      .select("*, profiles!user_id(full_name, email), projects(title)")
      .in("course_id", courseIds)
      .eq("status", "pending")
      .order("submitted_at", { ascending: false }),
  ]);

  logger.info("pending_submissions_fetched", {
    userId,
    assignments: assignRes.data?.length ?? 0,
    projects: projectRes.data?.length ?? 0,
  });

  return {
    assignmentSubmissions: assignRes.data ?? [],
    projectSubmissions: projectRes.data ?? [],
  };
}

/**
 * Get recently graded submissions for a professor's courses.
 * @param userId - The professor's user ID
 * @returns Object with recently graded assignment and project submissions
 * @throws Error if database query fails
 */
export async function getRecentGraded(userId: string) {
  const { data: courses } = await supabase
    .from("courses")
    .select("id")
    .eq("instructor_id", userId);

  const courseIds = (courses ?? []).map((c) => c.id);

  if (courseIds.length === 0) {
    return { assignmentSubmissions: [], projectSubmissions: [] };
  }

  const [assignRes, projectRes] = await Promise.all([
    supabase
      .from("assignment_submissions")
      .select("*, profiles!user_id(full_name, email), assignments(title)")
      .in("course_id", courseIds)
      .eq("status", "graded")
      .order("graded_at", { ascending: false })
      .limit(20),
    supabase
      .from("project_submissions")
      .select("*, profiles!user_id(full_name, email), projects(title)")
      .in("course_id", courseIds)
      .eq("status", "graded")
      .order("graded_at", { ascending: false })
      .limit(20),
  ]);

  logger.info("recent_graded_fetched", { userId });

  return {
    assignmentSubmissions: assignRes.data ?? [],
    projectSubmissions: projectRes.data ?? [],
  };
}
