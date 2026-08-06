import { supabase } from "../../db/supabase.js";
import { Logger } from "../../utils/logger.js";
import { NotFoundError } from "../../utils/errors.js";
import type { Assignment } from "@lms/shared";

const logger = new Logger("content.assignments");

interface CreateAssignmentData {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xp_reward: number;
  language: string;
  starter_code: string;
  requirements: string[];
  due_date: string | null;
  course_id: string;
}

interface UpdateAssignmentData {
  title?: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  xp_reward?: number;
  language?: string;
  starter_code?: string;
  requirements?: string[];
  due_date?: string | null;
}

/**
 * Create a new assignment in a module.
 * @param moduleId - The module ID
 * @param data - Assignment data
 * @returns The created assignment
 * @throws Error if insert fails
 */
export async function createAssignment(
  moduleId: string,
  data: CreateAssignmentData
): Promise<Assignment> {
  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({
      module_id: moduleId,
      course_id: data.course_id,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      xp_reward: data.xp_reward,
      language: data.language,
      starter_code: data.starter_code,
      requirements: data.requirements,
      due_date: data.due_date,
    })
    .select()
    .single();

  if (error) {
    logger.error("create_assignment_failed", error, { moduleId });
    throw error;
  }

  logger.info("assignment_created", { assignmentId: assignment.id, moduleId });
  return assignment as Assignment;
}

/**
 * Update an existing assignment.
 * @param assignmentId - The assignment ID
 * @param data - Fields to update
 * @returns The updated assignment
 * @throws {NotFoundError} If the assignment is not found
 */
export async function updateAssignment(
  assignmentId: string,
  data: UpdateAssignmentData
): Promise<Assignment> {
  const { data: assignment, error } = await supabase
    .from("assignments")
    .update(data)
    .eq("id", assignmentId)
    .select()
    .single();

  if (error || !assignment) {
    if (error?.code === "PGRST116" || !assignment) {
      throw new NotFoundError("Assignment");
    }
    logger.error("update_assignment_failed", error, { assignmentId });
    throw error;
  }

  logger.info("assignment_updated", { assignmentId });
  return assignment as Assignment;
}

/**
 * Delete an assignment by ID.
 * @param assignmentId - The assignment ID
 * @returns void
 * @throws {NotFoundError} If the assignment is not found
 */
export async function deleteAssignment(assignmentId: string): Promise<void> {
  const { error, count } = await supabase
    .from("assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    logger.error("delete_assignment_failed", error, { assignmentId });
    throw error;
  }

  if (count === 0) {
    throw new NotFoundError("Assignment");
  }

  logger.info("assignment_deleted", { assignmentId });
}
