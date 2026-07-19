"use server";

import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized: admin role required");
  }

  return { supabase, user };
}

export async function getUserList(options?: {
  search?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}) {
  const { supabase } = await requireAdmin();
  const page = options?.page ?? 0;
  const pageSize = options?.pageSize ?? 20;

  let query = supabase
    .from("profiles")
    .select("*, user_stats(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (options?.role && options.role !== "all") {
    query = query.eq("role", options.role);
  }

  if (options?.search) {
    query = query.or(
      `full_name.ilike.%${options.search}%,email.ilike.%${options.search}%`
    );
  }

  const { data, count } = await query;

  return { users: data ?? [], total: count ?? 0 };
}

export async function getUserById(userId: string) {
  const { supabase } = await requireAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", userId);

  return {
    profile,
    stats,
    enrolledCourseIds: (enrollments ?? []).map((e: any) => e.course_id),
  };
}

export async function updateUserRole(userId: string, role: string) {
  const { supabase } = await requireAdmin();

  if (!["student", "professor", "admin"].includes(role)) {
    throw new Error("Invalid role");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function deleteUser(userId: string) {
  const { supabase, user } = await requireAdmin();

  if (userId === user.id) {
    throw new Error("Cannot delete your own account");
  }

  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getSystemStats() {
  const { supabase } = await requireAdmin();

  const [profiles, courses, lessons, submissions, xpStats] = await Promise.all([
    supabase.from("profiles").select("role", { count: "exact" }),
    supabase.from("courses").select("id", { count: "exact" }),
    supabase.from("lessons").select("id", { count: "exact" }),
    supabase.from("assignment_submissions").select("id", { count: "exact" }),
    supabase.from("user_stats").select("total_xp"),
  ]);

  const allProfiles = profiles.data ?? [];
  const studentCount = allProfiles.filter((p: any) => p.role === "student").length;
  const professorCount = allProfiles.filter((p: any) => p.role === "professor").length;
  const adminCount = allProfiles.filter((p: any) => p.role === "admin").length;
  const totalXpEarned = (xpStats.data ?? []).reduce(
    (sum: number, s: any) => sum + (s.total_xp ?? 0),
    0
  );

  return {
    totalUsers: profiles.count ?? 0,
    students: studentCount,
    professors: professorCount,
    admins: adminCount,
    totalCourses: courses.count ?? 0,
    totalLessons: lessons.count ?? 0,
    totalSubmissions: submissions.count ?? 0,
    totalXpEarned,
  };
}

export async function getAllCourses() {
  const { supabase } = await requireAdmin();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("title");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id");

  const enrollmentCounts: Record<string, number> = {};
  (enrollments ?? []).forEach((e: any) => {
    enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] ?? 0) + 1;
  });

  return (courses ?? []).map((course: any) => ({
    ...course,
    enrollment_count: enrollmentCounts[course.id] ?? 0,
  }));
}

export async function createCourse(data: {
  title: string;
  slug: string;
  description?: string;
  difficulty?: string;
  category?: string;
}) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("courses").insert({
    title: data.title,
    slug: data.slug,
    description: data.description ?? "",
    difficulty: data.difficulty ?? "beginner",
    category: data.category ?? "general",
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function assignInstructor(courseId: string, professorId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("courses")
    .update({ instructor_id: professorId })
    .eq("id", courseId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getAllAchievements() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("achievements")
    .select("*")
    .order("title");

  return data ?? [];
}

export async function createAchievement(data: {
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xp_reward: number;
}) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("achievements").insert({
    title: data.title,
    description: data.description,
    icon: data.icon,
    category: data.category,
    rarity: data.rarity,
    xp_reward: data.xp_reward,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getAuditLog() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("xp_transactions")
    .select("*, profiles!xp_transactions_user_id_fkey(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  return data ?? [];
}

export async function getProfessorList() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "professor")
    .order("full_name");

  return data ?? [];
}

export async function getAnalyticsData() {
  const { supabase } = await requireAdmin();

  // User growth by month
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("created_at")
    .order("created_at");

  const monthCounts: Record<string, number> = {};
  (allProfiles ?? []).forEach((p: any) => {
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthCounts[key] = (monthCounts[key] ?? 0) + 1;
  });

  const userGrowth = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  // Course enrollment distribution
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("title");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id");

  const enrollmentCounts: Record<string, number> = {};
  (enrollments ?? []).forEach((e: any) => {
    enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] ?? 0) + 1;
  });

  const courseEnrollments = (courses ?? []).map((c: any) => ({
    title: c.title,
    count: enrollmentCounts[c.id] ?? 0,
  }));

  const maxEnrollment = Math.max(...courseEnrollments.map((c) => c.count), 1);

  // Top 10 students by XP
  const { data: topStudents } = await supabase
    .from("user_stats")
    .select("user_id, total_xp, level, profiles!user_stats_user_id_fkey(full_name, email)")
    .order("total_xp", { ascending: false })
    .limit(10);

  // Recent 20 submissions
  const { data: recentSubmissions } = await supabase
    .from("assignment_submissions")
    .select("*, profiles!assignment_submissions_user_id_fkey(full_name)")
    .order("submitted_at", { ascending: false })
    .limit(20);

  return {
    userGrowth,
    courseEnrollments,
    maxEnrollment,
    topStudents: topStudents ?? [],
    recentSubmissions: recentSubmissions ?? [],
  };
}
