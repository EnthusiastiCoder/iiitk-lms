import { supabase } from "../../db/supabase.js";
import { Logger } from "../../utils/logger.js";

const logger = new Logger("admin.analytics");

interface SystemStats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalSubmissions: number;
  totalXp: number;
}

/**
 * Get aggregate system statistics.
 * @returns Counts of users, courses, lessons, submissions, and total XP
 * @throws Error if database query fails
 */
export async function getSystemStats(): Promise<SystemStats> {
  const [usersRes, coursesRes, lessonsRes, assignSubRes, projSubRes, xpRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("courses")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("lessons")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("assignment_submissions")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("project_submissions")
        .select("id", { count: "exact", head: true }),
      supabase.from("user_stats").select("total_xp"),
    ]);

  const totalXp = (xpRes.data ?? []).reduce(
    (sum, row) => sum + (row.total_xp ?? 0),
    0
  );

  const stats: SystemStats = {
    totalUsers: usersRes.count ?? 0,
    totalCourses: coursesRes.count ?? 0,
    totalLessons: lessonsRes.count ?? 0,
    totalSubmissions: (assignSubRes.count ?? 0) + (projSubRes.count ?? 0),
    totalXp,
  };

  logger.info("system_stats_fetched", stats as unknown as Record<string, unknown>);
  return stats;
}

/**
 * Get the recent 100 XP transactions with profile join.
 * @returns Array of recent XP transactions with user info
 * @throws Error if database query fails
 */
export async function getAuditLog(): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from("xp_transactions")
    .select("*, profiles!user_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    logger.error("get_audit_log_failed", error);
    throw error;
  }

  logger.info("audit_log_fetched", { count: data?.length ?? 0 });
  return data ?? [];
}

/**
 * Get analytics data: user growth by month, enrollment distribution, top students.
 * @returns Analytics data object
 * @throws Error if database query fails
 */
export async function getAnalyticsData(): Promise<{
  userGrowth: { month: string; count: number }[];
  enrollmentDistribution: { courseId: string; title: string; count: number }[];
  topStudents: Record<string, unknown>[];
}> {
  const [profilesRes, enrollmentsRes, statsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("enrollments")
      .select("course_id, courses(title)")
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("user_stats")
      .select("user_id, total_xp, level, profiles!user_id(full_name)")
      .order("total_xp", { ascending: false })
      .limit(10),
  ]);

  const userGrowth = buildMonthlyGrowth(profilesRes.data ?? []);
  const enrollmentDist = buildEnrollmentDistribution(enrollmentsRes.data ?? []);

  logger.info("analytics_data_fetched", {});

  return {
    userGrowth,
    enrollmentDistribution: enrollmentDist,
    topStudents: statsRes.data ?? [],
  };
}

/** Group records by month (YYYY-MM) and return cumulative counts. */
function buildMonthlyGrowth(
  records: { created_at: string }[]
): { month: string; count: number }[] {
  const grouped: Record<string, number> = {};

  for (const r of records) {
    const month = r.created_at.slice(0, 7);
    grouped[month] = (grouped[month] ?? 0) + 1;
  }

  let cumulative = 0;
  return Object.keys(grouped)
    .sort()
    .map((month) => {
      cumulative += grouped[month];
      return { month, count: cumulative };
    });
}

/** Count enrollments per course. */
function buildEnrollmentDistribution(
  enrollments: { course_id: string; courses: unknown }[]
): { courseId: string; title: string; count: number }[] {
  const map: Record<string, { title: string; count: number }> = {};

  for (const e of enrollments) {
    if (!map[e.course_id]) {
      const courseData = e.courses as { title: string } | null;
      map[e.course_id] = { title: courseData?.title ?? "Unknown", count: 0 };
    }
    map[e.course_id].count += 1;
  }

  return Object.entries(map).map(([courseId, val]) => ({
    courseId,
    title: val.title,
    count: val.count,
  }));
}
