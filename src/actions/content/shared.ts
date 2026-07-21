"use server";

import { createClient } from "@/lib/supabase/server";
import type { Module, Lesson, Quiz, Assignment, Project } from "@/types/database";

export async function requireProfessorOrAdmin() {
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

  if (!profile || (profile.role !== "professor" && profile.role !== "admin")) {
    throw new Error("Unauthorized: professor or admin role required");
  }

  return { supabase, user };
}

export async function getCourseContentForProfessor(slug: string) {
  const { supabase } = await requireProfessorOrAdmin();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) return null;

  const [modulesResult, lessonsResult, quizzesResult, assignmentsResult, projectsResult] =
    await Promise.all([
      supabase
        .from("modules")
        .select("*")
        .eq("course_id", course.id)
        .order("order"),
      supabase
        .from("lessons")
        .select('id, module_id, title, description, "order", type, estimated_minutes, xp_reward, content')
        .eq("course_id", course.id)
        .order("order"),
      supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", course.id)
        .order("created_at"),
      supabase
        .from("assignments")
        .select("*")
        .eq("course_id", course.id)
        .order("created_at"),
      supabase
        .from("projects")
        .select("*")
        .eq("course_id", course.id)
        .order("created_at"),
    ]);

  const modules = modulesResult.data ?? [];
  const lessons = lessonsResult.data ?? [];
  const quizzes = quizzesResult.data ?? [];
  const assignments = assignmentsResult.data ?? [];
  const projects = projectsResult.data ?? [];

  return {
    ...course,
    modules: modules.map((m: Module) => ({
      ...m,
      lessons: lessons.filter((l: Pick<Lesson, "module_id">) => l.module_id === m.id),
      quizzes: quizzes.filter((q: Pick<Quiz, "module_id">) => q.module_id === m.id),
      assignments: assignments.filter((a: Pick<Assignment, "module_id">) => a.module_id === m.id),
      projects: projects.filter((p: Pick<Project, "module_id">) => p.module_id === m.id),
    })),
  };
}
