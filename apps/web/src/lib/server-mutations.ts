"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function mutate(path: string, method: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("lms_access_token")?.value;
  if (!token) return;
  await fetch(`${API_URL}/api${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteModule(moduleId: string) {
  await mutate(`/professor/modules/${moduleId}`, "DELETE");
  revalidatePath("/professor/courses");
}

export async function deleteLesson(lessonId: string) {
  await mutate(`/professor/lessons/${lessonId}`, "DELETE");
  revalidatePath("/professor/courses");
}

export async function deleteQuiz(quizId: string) {
  await mutate(`/professor/quizzes/${quizId}`, "DELETE");
  revalidatePath("/professor/courses");
}

export async function deleteAssignment(assignmentId: string) {
  await mutate(`/professor/assignments/${assignmentId}`, "DELETE");
  revalidatePath("/professor/courses");
}

export async function deleteProject(projectId: string) {
  await mutate(`/professor/projects/${projectId}`, "DELETE");
  revalidatePath("/professor/courses");
}
