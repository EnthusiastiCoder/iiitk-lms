import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";
import { NotFoundError } from "../utils/errors.js";
import type { Lesson } from "@lms/shared";

const logger = new Logger("lesson.service");

/**
 * Fetch a single lesson by its ID.
 * @param lessonId - The UUID of the lesson to retrieve.
 * @returns The lesson record.
 * @throws {NotFoundError} When no lesson matches the given ID.
 */
export async function getLessonContent(lessonId: string): Promise<Lesson> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error || !data) {
    logger.warn("lesson_not_found", { lessonId });
    throw new NotFoundError("Lesson");
  }

  return data as Lesson;
}

/**
 * Fetch the flashcard deck associated with a lesson.
 * @param lessonId - The UUID of the lesson whose deck to retrieve.
 * @returns The flashcard deck object, or null if none exists.
 */
export async function getFlashcardDeck(
  lessonId: string
): Promise<{ id: string; title: string; cards: { front: string; back: string }[] } | null> {
  const { data, error } = await supabase
    .from("flashcard_decks")
    .select("id, title, cards")
    .eq("lesson_id", lessonId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as { id: string; title: string; cards: { front: string; back: string }[] };
}

/** Result shape returned by {@link completeLesson}. */
interface CompleteLessonResult {
  xpEarned: number;
  alreadyCompleted: boolean;
}

/**
 * Check whether a lesson was already completed by a user.
 * @param userId - The user's UUID.
 * @param lessonId - The lesson's UUID.
 * @returns True if a completion record exists, false otherwise.
 */
async function isAlreadyCompleted(
  userId: string,
  lessonId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("lesson_completions")
    .select("id")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  return !!data;
}

/**
 * Fetch the XP reward value for a lesson.
 * @param lessonId - The lesson's UUID.
 * @returns The XP reward amount.
 * @throws {NotFoundError} When the lesson does not exist.
 */
async function fetchXpReward(lessonId: string): Promise<number> {
  const { data, error } = await supabase
    .from("lessons")
    .select("xp_reward")
    .eq("id", lessonId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Lesson");
  }

  return (data as { xp_reward: number }).xp_reward;
}

/**
 * Insert a lesson completion record.
 * @param userId - The user's UUID.
 * @param lessonId - The lesson's UUID.
 * @param courseId - The course's UUID.
 * @param xpReward - The XP earned for completing the lesson.
 */
async function insertCompletion(
  userId: string,
  lessonId: string,
  courseId: string,
  xpReward: number
): Promise<void> {
  const { error } = await supabase.from("lesson_completions").insert({
    user_id: userId,
    lesson_id: lessonId,
    course_id: courseId,
    xp_earned: xpReward,
  });

  if (error) {
    logger.error("insert_completion_failed", error, { userId, lessonId });
    throw error;
  }
}

/**
 * Record an XP transaction for a completed lesson.
 * @param userId - The user's UUID.
 * @param lessonId - The lesson's UUID.
 * @param xpReward - The amount of XP earned.
 */
async function insertXpTransaction(
  userId: string,
  lessonId: string,
  xpReward: number
): Promise<void> {
  const { error } = await supabase.from("xp_transactions").insert({
    user_id: userId,
    amount: xpReward,
    source_type: "lesson",
    source_id: lessonId,
    description: "Lesson completed",
  });

  if (error) {
    logger.error("insert_xp_transaction_failed", error, { userId, lessonId });
    throw error;
  }
}

/**
 * Increment user stats after lesson completion.
 * @param userId - The user's UUID.
 * @param xpReward - The XP to add to the user's total.
 */
async function updateUserStats(
  userId: string,
  xpReward: number
): Promise<void> {
  const { error } = await supabase.rpc("increment_user_stats", {
    p_user_id: userId,
    p_xp: xpReward,
    p_lessons: 1,
  });

  if (error) {
    logger.error("update_user_stats_failed", error, { userId });
    throw error;
  }
}

/**
 * Upsert today's streak log entry for the user.
 * @param userId - The user's UUID.
 * @param xpReward - The XP to add to today's streak entry.
 */
async function upsertStreakLog(
  userId: string,
  xpReward: number
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("streak_log")
    .select("id, xp_earned, lessons_completed")
    .eq("user_id", userId)
    .eq("activity_date", today)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("streak_log")
      .update({
        xp_earned: existing.xp_earned + xpReward,
        lessons_completed: existing.lessons_completed + 1,
      })
      .eq("id", existing.id);

    if (error) {
      logger.error("update_streak_log_failed", error, { userId });
      throw error;
    }
  } else {
    const { error } = await supabase.from("streak_log").insert({
      user_id: userId,
      activity_date: today,
      xp_earned: xpReward,
      lessons_completed: 1,
    });

    if (error) {
      logger.error("insert_streak_log_failed", error, { userId });
      throw error;
    }
  }
}

/**
 * Mark a lesson as completed for a user, awarding XP and updating stats.
 *
 * Steps: check if already completed, fetch XP reward, insert completion,
 * record XP transaction, update user stats, and upsert streak log.
 *
 * @param userId - The authenticated user's UUID.
 * @param lessonId - The lesson's UUID.
 * @param courseId - The course's UUID the lesson belongs to.
 * @returns An object with the XP earned and whether it was already completed.
 * @throws {NotFoundError} When the lesson does not exist.
 */
export async function completeLesson(
  userId: string,
  lessonId: string,
  courseId: string
): Promise<CompleteLessonResult> {
  if (await isAlreadyCompleted(userId, lessonId)) {
    return { xpEarned: 0, alreadyCompleted: true };
  }

  const xpReward = await fetchXpReward(lessonId);

  await insertCompletion(userId, lessonId, courseId, xpReward);
  await insertXpTransaction(userId, lessonId, xpReward);
  await updateUserStats(userId, xpReward);
  await upsertStreakLog(userId, xpReward);

  logger.info("lesson_completed", { userId, lessonId, xpReward });

  return { xpEarned: xpReward, alreadyCompleted: false };
}
