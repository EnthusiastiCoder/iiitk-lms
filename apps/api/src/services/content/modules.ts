import { supabase } from "../../db/supabase.js";
import { Logger } from "../../utils/logger.js";
import { NotFoundError } from "../../utils/errors.js";
import type { Module } from "@lms/shared";

const logger = new Logger("content.modules");

/**
 * Create a new module in a course.
 * @param courseId - The course ID
 * @param data - Module data (title, description, order)
 * @returns The created module
 * @throws Error if insert fails
 */
export async function createModule(
  courseId: string,
  data: { title: string; description: string; order: number }
): Promise<Module> {
  const { data: mod, error } = await supabase
    .from("modules")
    .insert({
      course_id: courseId,
      title: data.title,
      description: data.description,
      order: data.order,
    })
    .select()
    .single();

  if (error) {
    logger.error("create_module_failed", error, { courseId });
    throw error;
  }

  logger.info("module_created", { moduleId: mod.id, courseId });
  return mod as Module;
}

/**
 * Update an existing module.
 * @param moduleId - The module ID
 * @param data - Fields to update (title, description, order)
 * @returns The updated module
 * @throws {NotFoundError} If the module is not found
 */
export async function updateModule(
  moduleId: string,
  data: Partial<{ title: string; description: string; order: number }>
): Promise<Module> {
  const { data: mod, error } = await supabase
    .from("modules")
    .update(data)
    .eq("id", moduleId)
    .select()
    .single();

  if (error || !mod) {
    if (error?.code === "PGRST116" || !mod) {
      throw new NotFoundError("Module");
    }
    logger.error("update_module_failed", error, { moduleId });
    throw error;
  }

  logger.info("module_updated", { moduleId });
  return mod as Module;
}

/**
 * Delete a module by ID.
 * @param moduleId - The module ID
 * @returns void
 * @throws {NotFoundError} If the module is not found
 */
export async function deleteModule(moduleId: string): Promise<void> {
  const { error, count } = await supabase
    .from("modules")
    .delete()
    .eq("id", moduleId);

  if (error) {
    logger.error("delete_module_failed", error, { moduleId });
    throw error;
  }

  if (count === 0) {
    throw new NotFoundError("Module");
  }

  logger.info("module_deleted", { moduleId });
}
