import { supabase } from "../../db/supabase.js";
import { Logger } from "../../utils/logger.js";
import { NotFoundError } from "../../utils/errors.js";
import type { Project } from "@lms/shared";

const logger = new Logger("content.projects");

interface CreateProjectData {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xp_reward: number;
  language: string;
  starter_code: string;
  expected_output: string | null;
  requirements: string[];
  is_final_project: boolean;
  due_date: string | null;
  course_id: string;
}

interface UpdateProjectData {
  title?: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  xp_reward?: number;
  language?: string;
  starter_code?: string;
  expected_output?: string | null;
  requirements?: string[];
  is_final_project?: boolean;
  due_date?: string | null;
}

/**
 * Create a new project in a module.
 * @param moduleId - The module ID
 * @param data - Project data
 * @returns The created project
 * @throws Error if insert fails
 */
export async function createProject(
  moduleId: string,
  data: CreateProjectData
): Promise<Project> {
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      module_id: moduleId,
      course_id: data.course_id,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      xp_reward: data.xp_reward,
      language: data.language,
      starter_code: data.starter_code,
      expected_output: data.expected_output,
      requirements: data.requirements,
      is_final_project: data.is_final_project,
      due_date: data.due_date,
    })
    .select()
    .single();

  if (error) {
    logger.error("create_project_failed", error, { moduleId });
    throw error;
  }

  logger.info("project_created", { projectId: project.id, moduleId });
  return project as Project;
}

/**
 * Update an existing project.
 * @param projectId - The project ID
 * @param data - Fields to update
 * @returns The updated project
 * @throws {NotFoundError} If the project is not found
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectData
): Promise<Project> {
  const { data: project, error } = await supabase
    .from("projects")
    .update(data)
    .eq("id", projectId)
    .select()
    .single();

  if (error || !project) {
    if (error?.code === "PGRST116" || !project) {
      throw new NotFoundError("Project");
    }
    logger.error("update_project_failed", error, { projectId });
    throw error;
  }

  logger.info("project_updated", { projectId });
  return project as Project;
}

/**
 * Delete a project by ID.
 * @param projectId - The project ID
 * @returns void
 * @throws {NotFoundError} If the project is not found
 */
export async function deleteProject(projectId: string): Promise<void> {
  const { error, count } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    logger.error("delete_project_failed", error, { projectId });
    throw error;
  }

  if (count === 0) {
    throw new NotFoundError("Project");
  }

  logger.info("project_deleted", { projectId });
}
