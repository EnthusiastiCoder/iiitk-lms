"use server";

import { revalidatePath } from "next/cache";
import { Logger } from "@/lib/logger";

const log = new Logger("content");
import { requireProfessorOrAdmin } from "./shared";

export async function createQuiz(
  moduleId: string,
  courseId: string,
  data: {
    title: string;
    description: string;
    timeLimit: number;
    xpReward: number;
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const id = `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("quizzes").insert({
    id,
    module_id: moduleId,
    course_id: courseId,
    title: data.title,
    description: data.description,
    time_limit_minutes: data.timeLimit,
    xp_reward: data.xpReward,
    question_count: 0,
  });

  if (error) throw new Error(error.message);

  log.info("quiz.create", { professorId: user.id, type: "quiz", title: data.title, courseId, moduleId, quizId: id });
  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function createQuizQuestion(
  quizId: string,
  data: {
    type: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    xpReward: number;
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  // Get the next order value
  const { data: existing } = await supabase
    .from("quiz_questions")
    .select("order")
    .eq("quiz_id", quizId)
    .order("order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order ?? 0) + 1;
  const id = `qq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("quiz_questions").insert({
    id,
    quiz_id: quizId,
    type: data.type,
    question: data.question,
    options: data.options,
    correct_answer: data.correctAnswer,
    explanation: data.explanation,
    xp_reward: data.xpReward,
    order: nextOrder,
  });

  if (error) throw new Error(error.message);

  // Update question_count on the quiz
  const { count } = await supabase
    .from("quiz_questions")
    .select("id", { count: "exact" })
    .eq("quiz_id", quizId);

  await supabase
    .from("quizzes")
    .update({ question_count: count ?? 0 })
    .eq("id", quizId);

  log.info("quiz_question.create", { professorId: user.id, type: "quiz_question", quizId, questionId: id });
  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function updateQuiz(
  quizId: string,
  data: {
    title: string;
    description: string;
    timeLimit: number;
    xpReward: number;
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("quizzes")
    .update({
      title: data.title,
      description: data.description,
      time_limit_minutes: data.timeLimit,
      xp_reward: data.xpReward,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quizId);

  if (error) throw new Error(error.message);

  log.info("quiz.update", { professorId: user.id, type: "quiz", quizId, title: data.title });
  revalidatePath("/professor/courses");
  return { success: true };
}

export async function updateQuizQuestion(
  questionId: string,
  data: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("quiz_questions")
    .update({
      question: data.question,
      options: data.options,
      correct_answer: data.correctAnswer,
      explanation: data.explanation,
      updated_at: new Date().toISOString(),
    })
    .eq("id", questionId);

  if (error) throw new Error(error.message);

  log.info("quiz_question.update", { professorId: user.id, type: "quiz_question", questionId });
  revalidatePath("/professor/courses");
  return { success: true };
}

export async function deleteQuiz(quizId: string) {
  const { supabase, user } = await requireProfessorOrAdmin();

  // Delete questions first
  await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);

  const { error } = await supabase.from("quizzes").delete().eq("id", quizId);

  if (error) throw new Error(error.message);

  log.info("quiz.delete", { professorId: user.id, type: "quiz", quizId });
  revalidatePath("/professor/courses");
  return { success: true };
}
