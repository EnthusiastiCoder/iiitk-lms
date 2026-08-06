import { supabase } from "../../db/supabase.js";
import { Logger } from "../../utils/logger.js";
import { NotFoundError } from "../../utils/errors.js";
import type { CourseWithModules } from "@lms/shared";

const logger = new Logger("content.service");

/**
 * Get full course content for a professor, including all modules and their items.
 * @param slug - The course slug
 * @returns Course with modules, lessons, quizzes, assignments, and projects
 * @throws {NotFoundError} If the course is not found
 */
export async function getCourseContentForProfessor(
  slug: string
): Promise<CourseWithModules> {
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (courseError || !course) {
    throw new NotFoundError("Course");
  }

  const { data: modules, error: modError } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", course.id)
    .order("order", { ascending: true });

  if (modError) {
    logger.error("get_modules_failed", modError, { slug });
    throw modError;
  }

  const moduleIds = (modules ?? []).map((m) => m.id);

  if (moduleIds.length === 0) {
    logger.info("course_content_fetched", { slug, moduleCount: 0 });
    return { ...course, modules: [] } as CourseWithModules;
  }

  const [lessonsRes, quizzesRes, assignmentsRes, projectsRes] =
    await Promise.all([
      supabase
        .from("lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("order", { ascending: true }),
      supabase
        .from("quizzes")
        .select("*")
        .in("module_id", moduleIds),
      supabase
        .from("assignments")
        .select("*")
        .in("module_id", moduleIds),
      supabase
        .from("projects")
        .select("*")
        .in("module_id", moduleIds),
    ]);

  const enrichedModules = (modules ?? []).map((mod) => ({
    ...mod,
    lessons: (lessonsRes.data ?? []).filter((l) => l.module_id === mod.id),
    quizzes: (quizzesRes.data ?? []).filter((q) => q.module_id === mod.id),
    assignments: (assignmentsRes.data ?? []).filter(
      (a) => a.module_id === mod.id
    ),
    projects: (projectsRes.data ?? []).filter((p) => p.module_id === mod.id),
  }));

  logger.info("course_content_fetched", {
    slug,
    moduleCount: enrichedModules.length,
  });

  return { ...course, modules: enrichedModules } as CourseWithModules;
}

export {
  createModule,
  updateModule,
  deleteModule,
} from "./modules.js";

export {
  createLesson,
  updateLesson,
  deleteLesson,
} from "./lessons.js";

export {
  createQuiz,
  createQuizQuestion,
  updateQuiz,
  updateQuizQuestion,
  deleteQuiz,
} from "./quizzes.js";

export {
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "./assignments.js";

export {
  createProject,
  updateProject,
  deleteProject,
} from "./projects.js";
