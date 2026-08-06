import { supabase } from "../../db/supabase.js";
import { Logger } from "../../utils/logger.js";
import { NotFoundError } from "../../utils/errors.js";
import type { Quiz, QuizQuestion } from "@lms/shared";

const logger = new Logger("content.quizzes");

interface CreateQuizData {
  title: string;
  description: string;
  question_count: number;
  xp_reward: number;
  time_limit_minutes: number;
  is_final_exam: boolean;
  course_id: string;
}

interface CreateQuestionData {
  type: "multiple-choice" | "true-false" | "fill-blank";
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  xp_reward: number;
  order: number;
}

/**
 * Create a new quiz in a module.
 * @param moduleId - The module ID
 * @param data - Quiz data
 * @returns The created quiz
 * @throws Error if insert fails
 */
export async function createQuiz(
  moduleId: string,
  data: CreateQuizData
): Promise<Quiz> {
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .insert({
      module_id: moduleId,
      course_id: data.course_id,
      title: data.title,
      description: data.description,
      question_count: data.question_count,
      xp_reward: data.xp_reward,
      time_limit_minutes: data.time_limit_minutes,
      is_final_exam: data.is_final_exam,
    })
    .select()
    .single();

  if (error) {
    logger.error("create_quiz_failed", error, { moduleId });
    throw error;
  }

  logger.info("quiz_created", { quizId: quiz.id, moduleId });
  return quiz as Quiz;
}

/**
 * Create a new question for a quiz.
 * @param quizId - The quiz ID
 * @param data - Question data
 * @returns The created question
 * @throws Error if insert fails
 */
export async function createQuizQuestion(
  quizId: string,
  data: CreateQuestionData
): Promise<QuizQuestion> {
  const { data: question, error } = await supabase
    .from("quiz_questions")
    .insert({
      quiz_id: quizId,
      type: data.type,
      question: data.question,
      options: data.options,
      correct_answer: data.correct_answer,
      explanation: data.explanation,
      xp_reward: data.xp_reward,
      order: data.order,
    })
    .select()
    .single();

  if (error) {
    logger.error("create_quiz_question_failed", error, { quizId });
    throw error;
  }

  logger.info("quiz_question_created", { questionId: question.id, quizId });
  return question as QuizQuestion;
}

/**
 * Update an existing quiz.
 * @param quizId - The quiz ID
 * @param data - Fields to update
 * @returns The updated quiz
 * @throws {NotFoundError} If the quiz is not found
 */
export async function updateQuiz(
  quizId: string,
  data: Partial<Omit<CreateQuizData, "course_id">>
): Promise<Quiz> {
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .update(data)
    .eq("id", quizId)
    .select()
    .single();

  if (error || !quiz) {
    if (error?.code === "PGRST116" || !quiz) {
      throw new NotFoundError("Quiz");
    }
    logger.error("update_quiz_failed", error, { quizId });
    throw error;
  }

  logger.info("quiz_updated", { quizId });
  return quiz as Quiz;
}

/**
 * Update an existing quiz question.
 * @param questionId - The question ID
 * @param data - Fields to update
 * @returns The updated question
 * @throws {NotFoundError} If the question is not found
 */
export async function updateQuizQuestion(
  questionId: string,
  data: Partial<CreateQuestionData>
): Promise<QuizQuestion> {
  const { data: question, error } = await supabase
    .from("quiz_questions")
    .update(data)
    .eq("id", questionId)
    .select()
    .single();

  if (error || !question) {
    if (error?.code === "PGRST116" || !question) {
      throw new NotFoundError("Quiz question");
    }
    logger.error("update_quiz_question_failed", error, { questionId });
    throw error;
  }

  logger.info("quiz_question_updated", { questionId });
  return question as QuizQuestion;
}

/**
 * Delete a quiz by ID.
 * @param quizId - The quiz ID
 * @returns void
 * @throws {NotFoundError} If the quiz is not found
 */
export async function deleteQuiz(quizId: string): Promise<void> {
  const { error, count } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId);

  if (error) {
    logger.error("delete_quiz_failed", error, { quizId });
    throw error;
  }

  if (count === 0) {
    throw new NotFoundError("Quiz");
  }

  logger.info("quiz_deleted", { quizId });
}
