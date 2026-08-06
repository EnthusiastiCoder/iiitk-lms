"use server";

import { revalidatePath } from "next/cache";
import { Logger } from "@/lib/logger";

const log = new Logger("content");
import { requireProfessorOrAdmin } from "./shared";

export async function createProject(
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
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("projects").insert({
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
  });

  if (error) throw new Error(error.message);

  log.info("project.create", { professorId: user.id, type: "project", title: data.title, courseId, moduleId, projectId: id });
  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function updateProject(
  projectId: string,
  data: {
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    language: string;
    starterCode: string;
    requirements: string[];
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("projects")
    .update({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      xp_reward: data.xpReward,
      language: data.language,
      starter_code: data.starterCode,
      requirements: data.requirements,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  log.info("project.update", { professorId: user.id, type: "project", projectId, title: data.title });
  revalidatePath("/professor/courses");
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  log.info("project.delete", { professorId: user.id, type: "project", projectId });
  revalidatePath("/professor/courses");
  return { success: true };
}
