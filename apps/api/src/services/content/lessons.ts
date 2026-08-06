import { supabase } from "../../db/supabase.js";
import { Logger } from "../../utils/logger.js";
import { NotFoundError } from "../../utils/errors.js";
import type { Lesson, ContentSection } from "@lms/shared";

const logger = new Logger("content.lessons");

interface CreateLessonData {
  title: string;
  description: string;
  order: number;
  type: "reading" | "coding" | "quiz" | "mixed";
  estimated_minutes: number;
  xp_reward: number;
  content: { sections: ContentSection[] };
  course_id: string;
}

interface UpdateLessonData {
  title?: string;
  description?: string;
  order?: number;
  type?: "reading" | "coding" | "quiz" | "mixed";
  estimated_minutes?: number;
  xp_reward?: number;
  content?: { sections: ContentSection[] };
}

/**
 * Create a new lesson in a module.
 * @param moduleId - The module ID
 * @param data - Lesson data
 * @returns The created lesson
 * @throws Error if insert fails
 */
export async function createLesson(
  moduleId: string,
  data: CreateLessonData
): Promise<Lesson> {
  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert({
      module_id: moduleId,
      course_id: data.course_id,
      title: data.title,
      description: data.description,
      order: data.order,
      type: data.type,
      estimated_minutes: data.estimated_minutes,
      xp_reward: data.xp_reward,
      content: data.content,
    })
    .select()
    .single();

  if (error) {
    logger.error("create_lesson_failed", error, { moduleId });
    throw error;
  }

  logger.info("lesson_created", { lessonId: lesson.id, moduleId });
  return lesson as Lesson;
}

/**
 * Update an existing lesson.
 * @param lessonId - The lesson ID
 * @param data - Fields to update
 * @returns The updated lesson
 * @throws {NotFoundError} If the lesson is not found
 */
export async function updateLesson(
  lessonId: string,
  data: UpdateLessonData
): Promise<Lesson> {
  const { data: lesson, error } = await supabase
    .from("lessons")
    .update(data)
    .eq("id", lessonId)
    .select()
    .single();

  if (error || !lesson) {
    if (error?.code === "PGRST116" || !lesson) {
      throw new NotFoundError("Lesson");
    }
    logger.error("update_lesson_failed", error, { lessonId });
    throw error;
  }

  logger.info("lesson_updated", { lessonId });
  return lesson as Lesson;
}

/**
 * Delete a lesson by ID.
 * @param lessonId - The lesson ID
 * @returns void
 * @throws {NotFoundError} If the lesson is not found
 */
export async function deleteLesson(lessonId: string): Promise<void> {
  const { error, count } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId);

  if (error) {
    logger.error("delete_lesson_failed", error, { lessonId });
    throw error;
  }

  if (count === 0) {
    throw new NotFoundError("Lesson");
  }

  logger.info("lesson_deleted", { lessonId });
}
