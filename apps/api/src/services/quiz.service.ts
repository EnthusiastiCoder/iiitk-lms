import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";
import { NotFoundError } from "../utils/errors.js";
import type { Quiz, QuizQuestion } from "@lms/shared";

const logger = new Logger("quiz.service");

/** Quiz with its ordered list of questions. */
interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

/**
 * Fetch a quiz by ID along with all its questions ordered by position.
 * @param quizId - The UUID of the quiz to retrieve.
 * @returns The quiz record with its questions array.
 * @throws {NotFoundError} When no quiz matches the given ID.
 */
export async function getQuizWithQuestions(
  quizId: string
): Promise<QuizWithQuestions> {
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (quizError || !quiz) {
    logger.warn("quiz_not_found", { quizId });
    throw new NotFoundError("Quiz");
  }

  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("order", { ascending: true });

  if (questionsError) {
    logger.error("quiz_questions_fetch_failed", questionsError, { quizId });
    throw questionsError;
  }

  return {
    ...(quiz as Quiz),
    questions: (questions ?? []) as QuizQuestion[],
  };
}

/**
 * Calculate XP earned from a quiz attempt based on score percentage.
 * @param score - The student's score (0-100).
 * @param maxXp - The quiz's maximum XP reward.
 * @returns The XP earned, rounded down to the nearest integer.
 */
function calculateXpEarned(score: number, maxXp: number): number {
  return Math.floor((score * maxXp) / 100);
}

/**
 * Insert the quiz attempt record into the database.
 * @param userId - The user's UUID.
 * @param quizId - The quiz's UUID.
 * @param answers - Map of question ID to selected answer.
 * @param score - The calculated score (0-100).
 * @param xpEarned - The XP earned for this attempt.
 * @param timeSpent - Time spent in seconds.
 */
async function insertQuizAttempt(
  options: InsertQuizAttemptOptions
): Promise<void> {
  const { userId, quizId, answers, score, xpEarned, timeSpent } = options;
  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: userId,
    quiz_id: quizId,
    answers,
    score,
    xp_earned: xpEarned,
    time_spent: timeSpent,
  });

  if (error) {
    logger.error("insert_quiz_attempt_failed", error, { userId, quizId });
    throw error;
  }
}

/**
 * Record an XP transaction for a quiz attempt.
 * @param userId - The user's UUID.
 * @param quizId - The quiz's UUID.
 * @param xpEarned - The amount of XP earned.
 */
async function insertXpTransaction(
  userId: string,
  quizId: string,
  xpEarned: number
): Promise<void> {
  const { error } = await supabase.from("xp_transactions").insert({
    user_id: userId,
    amount: xpEarned,
    source_type: "quiz",
    source_id: quizId,
    description: "Quiz completed",
  });

  if (error) {
    logger.error("insert_xp_transaction_failed", error, { userId, quizId });
    throw error;
  }
}

/**
 * Increment user stats after a quiz attempt.
 * @param userId - The user's UUID.
 * @param xpEarned - The XP to add to the user's total.
 */
async function updateUserStats(
  userId: string,
  xpEarned: number
): Promise<void> {
  const { error } = await supabase.rpc("increment_user_stats", {
    p_user_id: userId,
    p_xp: xpEarned,
    p_lessons: 0,
  });

  if (error) {
    logger.error("update_user_stats_failed", error, { userId });
    throw error;
  }
}

/** Options for inserting a quiz attempt record. */
interface InsertQuizAttemptOptions {
  userId: string;
  quizId: string;
  answers: Record<string, string>;
  score: number;
  xpEarned: number;
  timeSpent: number;
}

/** Options for submitting a quiz attempt. */
interface SubmitQuizAttemptOptions {
  userId: string;
  quizId: string;
  answers: Record<string, string>;
  score: number;
  timeSpent: number;
}

/** Result shape returned by {@link submitQuizAttempt}. */
interface QuizAttemptResult {
  score: number;
  xpEarned: number;
}

/**
 * Submit a quiz attempt, calculate XP, and update user stats.
 *
 * Steps: fetch quiz to get max XP, calculate earned XP, insert attempt,
 * record XP transaction, and increment user stats.
 *
 * @param userId - The authenticated user's UUID.
 * @param quizId - The quiz's UUID.
 * @param answers - Map of question ID to selected answer.
 * @param score - The calculated score (0-100).
 * @param timeSpent - Time spent on the quiz in seconds.
 * @returns An object with the score and XP earned.
 * @throws {NotFoundError} When the quiz does not exist.
 */
export async function submitQuizAttempt(
  options: SubmitQuizAttemptOptions
): Promise<QuizAttemptResult> {
  const { userId, quizId, answers, score, timeSpent } = options;
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select("xp_reward")
    .eq("id", quizId)
    .single();

  if (error || !quiz) {
    logger.warn("quiz_not_found_for_attempt", { quizId });
    throw new NotFoundError("Quiz");
  }

  const xpEarned = calculateXpEarned(
    score,
    (quiz as { xp_reward: number }).xp_reward
  );

  await insertQuizAttempt({ userId, quizId, answers, score, xpEarned, timeSpent });
  await insertXpTransaction(userId, quizId, xpEarned);
  await updateUserStats(userId, xpEarned);

  logger.info("quiz_attempt_submitted", { userId, quizId, score, xpEarned });

  return { score, xpEarned };
}
