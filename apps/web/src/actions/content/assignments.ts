"use server";

import { revalidatePath } from "next/cache";
import { Logger } from "@/lib/logger";

const log = new Logger("content");
import { requireProfessorOrAdmin } from "./shared";

export async function createAssignment(
  moduleId: string,
  courseId: string,
  data: {
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    language: string;
    starterCode: string;
    requirements: string[];
    dueDate?: string;
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const id = `asgn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("assignments").insert({
    id,
    module_id: moduleId,
    course_id: courseId,
    title: data.title,
    description: data.description,
    difficulty: data.difficulty,
    xp_reward: data.xpReward,
    language: data.language,
    starter_code: data.starterCode,
    requirements: data.requirements,
    due_date: data.dueDate || null,
  });

  if (error) throw new Error(error.message);

  log.info("assignment.create", { professorId: user.id, type: "assignment", title: data.title, courseId, moduleId, assignmentId: id });
  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function updateAssignment(
  assignmentId: string,
  data: {
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    language: string;
    starterCode: string;
    requirements: string[];
    dueDate?: string;
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("assignments")
    .update({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      xp_reward: data.xpReward,
      language: data.language,
      starter_code: data.starterCode,
      requirements: data.requirements,
      due_date: data.dueDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assignmentId);

  if (error) throw new Error(error.message);

  log.info("assignment.update", { professorId: user.id, type: "assignment", assignmentId, title: data.title });
  revalidatePath("/professor/courses");
  return { success: true };
}

export async function deleteAssignment(assignmentId: string) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) throw new Error(error.message);

  log.info("assignment.delete", { professorId: user.id, type: "assignment", assignmentId });
  revalidatePath("/professor/courses");
  return { success: true };
}
