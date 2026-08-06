import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";
import { NotFoundError } from "../utils/errors.js";
import type {
  Course,
  CourseWithModules,
  Module,
  Lesson,
  Quiz,
  Assignment,
  Project,
} from "@lms/shared";

const logger = new Logger("course.service");

/**
 * Fetch all courses from the database.
 * @returns All courses ordered by creation date
 * @throws Error if the database query fails
 */
export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("get_all_courses_failed", error);
    throw error;
  }

  logger.info("courses_fetched", { count: data.length });
  return data as Course[];
}

/**
 * Fetch a single course by its URL slug.
 * @param slug - The unique slug identifier for the course
 * @returns The matching course
 * @throws {NotFoundError} If no course exists with the given slug
 */
export async function getCourseBySlug(slug: string): Promise<Course> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    logger.warn("course_not_found", { slug });
    throw new NotFoundError("Course");
  }

  return data as Course;
}

/**
 * Fetch a course with all its modules and nested content items.
 * Each module includes its lessons, quizzes, assignments, and projects.
 * @param slug - The unique slug identifier for the course
 * @returns The course with fully populated module tree
 * @throws {NotFoundError} If no course exists with the given slug
 */
export async function getCourseWithModules(
  slug: string
): Promise<CourseWithModules> {
  const course = await getCourseBySlug(slug);

  const { data: modules, error: modulesError } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", course.id)
    .order("order", { ascending: true });

  if (modulesError) {
    logger.error("get_modules_failed", modulesError, { courseId: course.id });
    throw modulesError;
  }

  const populatedModules = await Promise.all(
    (modules as Module[]).map((mod) => populateModule(mod))
  );

  logger.info("course_with_modules_fetched", {
    slug,
    moduleCount: populatedModules.length,
  });

  return { ...course, modules: populatedModules };
}

/**
 * Fetch all content items (lessons, quizzes, assignments, projects) for a module.
 * @param mod - The module to populate with content
 * @returns The module with all nested content arrays
 */
async function populateModule(mod: Module): Promise<
  Module & { lessons: Lesson[]; quizzes: Quiz[]; assignments: Assignment[]; projects: Project[] }
> {
  const [lessonsResult, quizzesResult, assignmentsResult, projectsResult] =
    await Promise.all([
      supabase
        .from("lessons")
        .select("*")
        .eq("module_id", mod.id)
        .order("order", { ascending: true }),
      supabase.from("quizzes").select("*").eq("module_id", mod.id),
      supabase.from("assignments").select("*").eq("module_id", mod.id),
      supabase.from("projects").select("*").eq("module_id", mod.id),
    ]);

  if (lessonsResult.error) {
    logger.error("get_lessons_failed", lessonsResult.error, {
      moduleId: mod.id,
    });
  }
  if (quizzesResult.error) {
    logger.error("get_quizzes_failed", quizzesResult.error, {
      moduleId: mod.id,
    });
  }
  if (assignmentsResult.error) {
    logger.error("get_assignments_failed", assignmentsResult.error, {
      moduleId: mod.id,
    });
  }
  if (projectsResult.error) {
    logger.error("get_projects_failed", projectsResult.error, {
      moduleId: mod.id,
    });
  }

  return {
    ...mod,
    lessons: (lessonsResult.data ?? []) as Lesson[],
    quizzes: (quizzesResult.data ?? []) as Quiz[],
    assignments: (assignmentsResult.data ?? []) as Assignment[],
    projects: (projectsResult.data ?? []) as Project[],
  };
}
