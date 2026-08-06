import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import type { Enrollment, LessonCompletion } from "@lms/shared";

const logger = new Logger("enrollment.service");

/**
 * Fetch all enrollments for a given user.
 * @param userId - The ID of the user
 * @returns All enrollment records for the user
 */
export async function getUserEnrollments(
  userId: string
): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  if (error) {
    logger.error("get_enrollments_failed", error, { userId });
    throw error;
  }

  logger.info("enrollments_fetched", { userId, count: data.length });
  return data as Enrollment[];
}

/**
 * Fetch lesson completions for a user, optionally filtered by course.
 * @param userId - The ID of the user
 * @param courseId - Optional course ID to filter completions
 * @returns Matching lesson completion records
 */
export async function getUserCompletions(
  userId: string,
  courseId?: string
): Promise<LessonCompletion[]> {
  let query = supabase
    .from("lesson_completions")
    .select("*")
    .eq("user_id", userId);

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query.order("completed_at", {
    ascending: false,
  });

  if (error) {
    logger.error("get_completions_failed", error, { userId, courseId });
    throw error;
  }

  logger.info("completions_fetched", {
    userId,
    courseId: courseId ?? "all",
    count: data.length,
  });
  return data as LessonCompletion[];
}

/**
 * Enroll a user in a course. Prevents duplicate enrollments.
 * @param userId - The ID of the user to enroll
 * @param courseId - The ID of the course to enroll in
 * @returns The newly created enrollment record
 * @throws {ConflictError} If the user is already enrolled in the course
 * @throws {NotFoundError} If the course does not exist
 */
export async function enrollInCourse(
  userId: string,
  courseId: string
): Promise<Enrollment> {
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .single();

  if (!course) {
    logger.warn("enroll_course_not_found", { userId, courseId });
    throw new NotFoundError("Course");
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    logger.warn("duplicate_enrollment", { userId, courseId });
    throw new ConflictError("Already enrolled in this course");
  }

  const { data, error } = await supabase
    .from("enrollments")
    .insert({ user_id: userId, course_id: courseId })
    .select("*")
    .single();

  if (error) {
    logger.error("enrollment_failed", error, { userId, courseId });
    throw error;
  }

  logger.info("user_enrolled", { userId, courseId });
  return data as Enrollment;
}
