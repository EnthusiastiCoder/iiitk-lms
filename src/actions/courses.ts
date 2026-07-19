"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("title");

  if (error) throw new Error(error.message);
  return data;
}

export async function getCourseBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getCourseWithModules(slug: string) {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) return null;

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", course.id)
    .order("order");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, module_id, title, description, \"order\", type, estimated_minutes, xp_reward")
    .eq("course_id", course.id)
    .order("order");

  return {
    ...course,
    modules: (modules ?? []).map((m: any) => ({
      ...m,
      lessons: (lessons ?? []).filter((l: any) => l.module_id === m.id),
    })),
  };
}

export async function getUserEnrollments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id);

  return data ?? [];
}

export async function getUserCompletions(courseId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("lesson_completions")
    .select("lesson_id, course_id, completed_at")
    .eq("user_id", user.id);

  if (courseId) query = query.eq("course_id", courseId);

  const { data } = await query;
  return data ?? [];
}

export async function enrollInCourse(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: user.id, course_id: courseId });

  if (error && !error.message.includes("duplicate")) throw new Error(error.message);

  revalidatePath("/student");
  revalidatePath("/student/courses");
}
