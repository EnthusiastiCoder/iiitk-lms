"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Logger } from "@/lib/logger";

const log = new Logger("submissions");

export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>,
  score: number,
  timeSpent: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("xp_reward")
    .eq("id", quizId)
    .single();

  const xp = Math.round(((quiz?.xp_reward ?? 50) * score) / 100);

  await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    quiz_id: quizId,
    score,
    answers,
    xp_earned: xp,
    completed_at: new Date().toISOString(),
    time_spent_seconds: timeSpent,
  });

  if (xp > 0) {
    await supabase.from("xp_transactions").insert({
      user_id: user.id,
      amount: xp,
      source_type: "quiz",
      source_id: quizId,
      description: `Quiz score: ${score}%`,
    });
  }

  log.info("quiz.submit", { userId: user.id, quizId, score, xpEarned: xp });
  revalidatePath("/student/practice");
  return { score, xpEarned: xp };
}

export async function submitAssignment(
  assignmentId: string,
  courseId: string,
  code: string,
  fileUrls?: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase.from("assignment_submissions").insert({
    user_id: user.id,
    assignment_id: assignmentId,
    course_id: courseId,
    code,
    status: "pending",
    file_urls: fileUrls?.length ? fileUrls : null,
  });

  log.info("assignment.submit", { userId: user.id, assignmentId, courseId });
  revalidatePath("/student/submissions");
  return { success: true };
}

export async function submitProject(
  projectId: string,
  courseId: string,
  code: string,
  fileUrls?: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase.from("project_submissions").insert({
    user_id: user.id,
    project_id: projectId,
    course_id: courseId,
    code,
    status: "pending",
    file_urls: fileUrls?.length ? fileUrls : null,
  });

  log.info("project.submit", { userId: user.id, projectId, courseId });
  revalidatePath("/student/submissions");
  return { success: true };
}

export async function gradeSubmission(
  submissionId: string,
  table: "assignment_submissions" | "project_submissions",
  grade: number,
  feedback: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "professor" && profile.role !== "admin")) {
    throw new Error("Unauthorized: professor or admin role required");
  }

  await supabase
    .from(table)
    .update({
      status: "graded",
      grade,
      feedback,
      graded_by: user.id,
      graded_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  log.info("grade", { gradedBy: user.id, submissionId, table, grade });
  revalidatePath("/professor/grading");
  return { success: true };
}

export async function getUserSubmissions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { assignments: [], projects: [], quizzes: [] };

  const [asgn, proj, quiz] = await Promise.all([
    supabase.from("assignment_submissions").select("*").eq("user_id", user.id).order("submitted_at", { ascending: false }),
    supabase.from("project_submissions").select("*").eq("user_id", user.id).order("submitted_at", { ascending: false }),
    supabase.from("quiz_attempts").select("*").eq("user_id", user.id).order("started_at", { ascending: false }),
  ]);

  return {
    assignments: asgn.data ?? [],
    projects: proj.data ?? [],
    quizzes: quiz.data ?? [],
  };
}
