import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger("streak.service");

/**
 * Recalculate current and longest streak from streak log and update user stats.
 * @param userId - UUID of the user whose streak stats should be refreshed
 * @returns Resolves when streak stats have been updated
 */
export async function updateStreakStats(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("streak_log")
    .select("activity_date")
    .eq("user_id", userId)
    .order("activity_date", { ascending: false });

  if (error || !data?.length) {
    logger.warn("streak_recalc_no_data", { userId });
    return;
  }

  const dates = data.map((r) => r.activity_date as string);
  const currentStreak = countCurrentStreak(dates);
  const longestStreak = countLongestStreak(dates);

  await supabase
    .from("user_stats")
    .update({ current_streak: currentStreak, longest_streak: longestStreak })
    .eq("user_id", userId);

  logger.info("streak_stats_updated", { userId, currentStreak, longestStreak });
}

/** Count consecutive days ending at today or yesterday. */
function countCurrentStreak(sortedDatesDesc: string[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (sortedDatesDesc[0] !== todayStr && sortedDatesDesc[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sortedDatesDesc.length; i++) {
    const diffDays = daysBetween(sortedDatesDesc[i - 1], sortedDatesDesc[i]);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

/** Find the longest run of consecutive days. */
function countLongestStreak(sortedDatesDesc: string[]): number {
  if (sortedDatesDesc.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < sortedDatesDesc.length; i++) {
    const diffDays = daysBetween(sortedDatesDesc[i - 1], sortedDatesDesc[i]);
    if (diffDays === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }

  return longest;
}

/** Compute absolute difference in calendar days between two date strings. */
function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(
    Math.abs(new Date(a).getTime() - new Date(b).getTime()) / msPerDay
  );
}
