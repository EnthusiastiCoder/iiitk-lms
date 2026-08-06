import { supabase } from "../../db/supabase.js";
import { Logger } from "../../utils/logger.js";
import { NotFoundError } from "../../utils/errors.js";
import type { Course } from "@lms/shared";

const logger = new Logger("admin.courses");

interface CourseWithEnrollments extends Course {
  enrollmentCount: number;
}

interface CreateCourseData {
  title: string;
  slug: string;
  description: string;
  long_description: string;
  accent_color: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "regular" | "backlog";
  estimated_hours: number;
  instructor_id: string | null;
  prerequisites: string[];
  tags: string[];
  total_lessons: number;
  total_xp: number;
}

/**
 * Get all courses with enrollment counts.
 * @returns Array of courses with enrollment counts
 * @throws Error if database query fails
 */
export async function getAllCourses(): Promise<CourseWithEnrollments[]> {
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*, profiles!instructor_id(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("get_all_courses_failed", error);
    throw error;
  }

  const courseList = courses ?? [];

  const withCounts = await Promise.all(
    courseList.map(async (course) => {
      const { count } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("course_id", course.id);

      return { ...course, enrollmentCount: count ?? 0 };
    })
  );

  logger.info("all_courses_fetched", { count: withCounts.length });
  return withCounts as CourseWithEnrollments[];
}

/**
 * Create a new course.
 * @param data - Course data
 * @returns The created course
 * @throws Error if insert fails
 */
export async function createCourse(data: CreateCourseData): Promise<Course> {
  const { data: course, error } = await supabase
    .from("courses")
    .insert(data)
    .select()
    .single();

  if (error) {
    logger.error("create_course_failed", error);
    throw error;
  }

  logger.info("course_created", { courseId: course.id });
  return course as Course;
}

/**
 * Delete a course by ID.
 * @param courseId - The course ID
 * @returns void
 * @throws {NotFoundError} If the course is not found
 */
export async function deleteCourse(courseId: string): Promise<void> {
  const { error, count } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId);

  if (error) {
    logger.error("delete_course_failed", error, { courseId });
    throw error;
  }

  if (count === 0) {
    throw new NotFoundError("Course");
  }

  logger.info("course_deleted", { courseId });
}

/**
 * Assign a professor as the instructor for a course.
 * @param courseId - The course ID
 * @param professorId - The professor's user ID
 * @returns The updated course
 * @throws {NotFoundError} If the course is not found
 */
export async function assignInstructor(
  courseId: string,
  professorId: string
): Promise<Course> {
  const { data: course, error } = await supabase
    .from("courses")
    .update({ instructor_id: professorId })
    .eq("id", courseId)
    .select()
    .single();

  if (error || !course) {
    if (error?.code === "PGRST116" || !course) {
      throw new NotFoundError("Course");
    }
    logger.error("assign_instructor_failed", error, { courseId, professorId });
    throw error;
  }

  logger.info("instructor_assigned", { courseId, professorId });
  return course as Course;
}
