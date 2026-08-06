"use server";

import { revalidatePath } from "next/cache";
import { Logger } from "@/lib/logger";

const log = new Logger("content");
import { requireProfessorOrAdmin } from "./shared";

export async function createLesson(
  moduleId: string,
  courseId: string,
  data: {
    title: string;
    description: string;
    type: string;
    estimatedMinutes: number;
    xpReward: number;
    content: unknown;
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  // Get the next order value
  const { data: existing } = await supabase
    .from("lessons")
    .select("order")
    .eq("module_id", moduleId)
    .order("order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order ?? 0) + 1;
  const id = `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("lessons").insert({
    id,
    module_id: moduleId,
    course_id: courseId,
    title: data.title,
    description: data.description,
    order: nextOrder,
    type: data.type,
    estimated_minutes: data.estimatedMinutes,
    xp_reward: data.xpReward,
    content: data.content,
  });

  if (error) {
    log.error(error.message, { professorId: user.id, moduleId, courseId });
    throw new Error(error.message);
  }

  // Update total_lessons on the course
  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact" })
    .eq("course_id", courseId);

  await supabase
    .from("courses")
    .update({ total_lessons: count ?? 0 })
    .eq("id", courseId);

  log.info("lesson.create", { professorId: user.id, type: "lesson", title: data.title, courseId, moduleId, lessonId: id });
  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function updateLesson(
  lessonId: string,
  data: Partial<{
    title: string;
    description: string;
    type: string;
    estimatedMinutes: number;
    xpReward: number;
    content: unknown;
  }>
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.estimatedMinutes !== undefined)
    updateData.estimated_minutes = data.estimatedMinutes;
  if (data.xpReward !== undefined) updateData.xp_reward = data.xpReward;
  if (data.content !== undefined) updateData.content = data.content;
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("lessons")
    .update(updateData)
    .eq("id", lessonId);

  if (error) throw new Error(error.message);

  log.info("lesson.update", { professorId: user.id, type: "lesson", lessonId });
  revalidatePath("/professor/courses");
  return { success: true };
}

export async function deleteLesson(lessonId: string) {
  const { supabase, user } = await requireProfessorOrAdmin();

  // Get course_id before deleting
  const { data: lesson } = await supabase
    .from("lessons")
    .select("course_id")
    .eq("id", lessonId)
    .single();

  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

  if (error) throw new Error(error.message);

  // Update total_lessons on the course
  if (lesson?.course_id) {
    const { count } = await supabase
      .from("lessons")
      .select("id", { count: "exact" })
      .eq("course_id", lesson.course_id);

    await supabase
      .from("courses")
      .update({ total_lessons: count ?? 0 })
      .eq("id", lesson.course_id);
  }

  log.info("lesson.delete", { professorId: user.id, type: "lesson", lessonId });
  revalidatePath("/professor/courses");
  return { success: true };
}
