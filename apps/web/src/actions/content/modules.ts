"use server";

import { revalidatePath } from "next/cache";
import { Logger } from "@/lib/logger";

const log = new Logger("content");
import { requireProfessorOrAdmin } from "./shared";

export async function createModule(
  courseId: string,
  data: { title: string; description: string }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  // Get the next order value
  const { data: existing } = await supabase
    .from("modules")
    .select("order")
    .eq("course_id", courseId)
    .order("order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order ?? 0) + 1;
  const id = `mod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("modules").insert({
    id,
    course_id: courseId,
    title: data.title,
    description: data.description,
    order: nextOrder,
  });

  if (error) {
    log.error(error.message, { professorId: user.id, courseId });
    throw new Error(error.message);
  }

  log.info("module.create", { professorId: user.id, type: "module", title: data.title, courseId, moduleId: id });
  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function updateModule(
  moduleId: string,
  data: { title: string; description: string }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("modules")
    .update({
      title: data.title,
      description: data.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", moduleId);

  if (error) throw new Error(error.message);

  log.info("module.update", { professorId: user.id, type: "module", moduleId, title: data.title });
  revalidatePath("/professor/courses");
  return { success: true };
}

export async function deleteModule(moduleId: string) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const { error } = await supabase.from("modules").delete().eq("id", moduleId);

  if (error) throw new Error(error.message);

  log.info("module.delete", { professorId: user.id, type: "module", moduleId });
  revalidatePath("/professor/courses");
  return { success: true };
}
