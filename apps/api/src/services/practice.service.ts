import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";
import type { Quiz, QuizAttempt, Enrollment } from "@lms/shared";

const logger = new Logger("practice.service");

/** Minimal course info returned alongside practice quizzes. */
interface PracticeCourse {
  id: string;
  title: string;
  slug: string;
}

/** Aggregated practice data for the authenticated user. */
export interface PracticeData {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  courses: PracticeCourse[];
}

/**
 * Fetch all practice data for a user: enrolled quizzes, attempts, and course info.
 *
 * Steps:
 * 1. Get the user's enrollments to determine enrolled course IDs.
 * 2. Get all quizzes belonging to those courses.
 * 3. Get the user's quiz attempts.
 * 4. Get enrolled course info (id, title, slug).
 *
 * @param userId - UUID of the authenticated user
 * @returns Practice data containing quizzes, attempts, and courses
 */
export async function getPracticeData(userId: string): Promise<PracticeData> {
  const courseIds = await getEnrolledCourseIds(userId);

  if (courseIds.length === 0) {
    logger.info("practice_no_enrollments", { userId });
    return { quizzes: [], attempts: [], courses: [] };
  }

  const [quizzes, attempts, courses] = await Promise.all([
    fetchQuizzesForCourses(courseIds),
    fetchUserAttempts(userId),
    fetchCourseInfo(courseIds),
  ]);

  logger.info("practice_data_fetched", {
    userId,
    quizCount: quizzes.length,
    attemptCount: attempts.length,
    courseCount: courses.length,
  });

  return { quizzes, attempts, courses };
}

/**
 * Get enrolled course IDs for a user.
 * @param userId - UUID of the authenticated user
 * @returns Array of course ID strings
 */
async function getEnrolledCourseIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", userId);

  if (error) {
    logger.error("practice_enrollments_failed", error, { userId });
    throw error;
  }

  return (data ?? []).map((e: Pick<Enrollment, "course_id">) => e.course_id);
}

/**
 * Fetch all quizzes for the given course IDs.
 * @param courseIds - Array of course UUID strings
 * @returns Array of Quiz records
 */
async function fetchQuizzesForCourses(courseIds: string[]): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .in("course_id", courseIds)
    .order("title");

  if (error) {
    logger.error("practice_quizzes_failed", error, { courseIds });
    throw error;
  }

  return (data ?? []) as Quiz[];
}

/**
 * Fetch all quiz attempts for a user.
 * @param userId - UUID of the authenticated user
 * @returns Array of QuizAttempt records ordered by most recent first
 */
async function fetchUserAttempts(userId: string): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) {
    logger.error("practice_attempts_failed", error, { userId });
    throw error;
  }

  return (data ?? []) as QuizAttempt[];
}

/**
 * Fetch minimal course info for the given course IDs.
 * @param courseIds - Array of course UUID strings
 * @returns Array of course objects with id, title, and slug
 */
async function fetchCourseInfo(
  courseIds: string[]
): Promise<PracticeCourse[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, slug")
    .in("id", courseIds)
    .order("title");

  if (error) {
    logger.error("practice_courses_failed", error, { courseIds });
    throw error;
  }

  return (data ?? []) as PracticeCourse[];
}
