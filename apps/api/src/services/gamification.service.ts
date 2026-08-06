import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";
import { NotFoundError } from "../utils/errors.js";
import type { Profile, UserStats, Achievement, StreakLog } from "@lms/shared";

const logger = new Logger("gamification.service");

/**
 * Fetch the top 50 users by XP for the leaderboard.
 * @returns Array of user profiles paired with their stats, ordered by total XP descending
 */
export async function getLeaderboard(): Promise<
  { profile: Profile; stats: UserStats }[]
> {
  const { data: statsRows, error: statsError } = await supabase
    .from("user_stats")
    .select("*")
    .order("total_xp", { ascending: false })
    .limit(50);

  if (statsError || !statsRows?.length) {
    logger.warn("leaderboard_empty", { error: statsError?.message });
    return [];
  }

  const userIds = statsRows.map((s) => s.user_id as string);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id as string, p as Profile])
  );

  logger.info("leaderboard_fetched", { count: statsRows.length });

  return statsRows
    .filter((s) => profileMap.has(s.user_id as string))
    .map((s) => ({
      profile: profileMap.get(s.user_id as string)!,
      stats: s as UserStats,
    }));
}

/**
 * Get all achievements with the authenticated user's progress and earned status.
 * @param userId - UUID of the authenticated user
 * @returns Array of achievements annotated with progress, earned flag, and earned timestamp
 */
export async function getUserAchievements(
  userId: string
): Promise<
  (Achievement & { progress: number; earned: boolean; earned_at: string | null })[]
> {
  const [achievementsResult, userResult] = await Promise.all([
    supabase.from("achievements").select("*").order("rarity"),
    supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId),
  ]);

  const achievements = (achievementsResult.data ?? []) as Achievement[];
  type UserAchievementRow = {
    achievement_id: string;
    progress: number;
    earned: boolean;
    earned_at: string | null;
  };
  const userMap = new Map(
    ((userResult.data ?? []) as UserAchievementRow[]).map((ua) => [
      ua.achievement_id,
      ua,
    ])
  );

  logger.info("achievements_fetched", { userId, count: achievements.length });

  return achievements.map((a) => {
    const ua = userMap.get(a.id);
    return {
      ...a,
      progress: ua?.progress ?? 0,
      earned: ua?.earned ?? false,
      earned_at: ua?.earned_at ?? null,
    };
  });
}

/**
 * Get streak log entries for the last 30 days.
 * @param userId - UUID of the authenticated user
 * @returns Array of streak log entries ordered by activity date descending
 */
export async function getStreakData(userId: string): Promise<StreakLog[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("streak_log")
    .select("*")
    .eq("user_id", userId)
    .gte("activity_date", cutoff)
    .order("activity_date", { ascending: false });

  if (error) {
    logger.error("streak_fetch_failed", error, { userId });
    return [];
  }

  logger.info("streak_fetched", { userId, days: data?.length ?? 0 });
  return (data ?? []) as StreakLog[];
}

/**
 * Get daily XP totals for the current week (Monday through Sunday).
 * @param userId - UUID of the authenticated user
 * @returns Array of 7 objects with date string and XP earned for each weekday
 */
export async function getWeeklyXp(
  userId: string
): Promise<{ date: string; xp: number }[]> {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const mondayStr = monday.toISOString().split("T")[0];
  const sundayStr = sunday.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("streak_log")
    .select("activity_date, xp_earned")
    .eq("user_id", userId)
    .gte("activity_date", mondayStr)
    .lte("activity_date", sundayStr);

  if (error) {
    logger.error("weekly_xp_fetch_failed", error, { userId });
  }

  const xpMap = new Map(
    (data ?? []).map((r) => [r.activity_date as string, r.xp_earned as number])
  );

  const result: { date: string; xp: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    result.push({ date: dateStr, xp: xpMap.get(dateStr) ?? 0 });
  }

  logger.info("weekly_xp_fetched", { userId, week: mondayStr });
  return result;
}

/** Map an achievement category to the relevant user stat value. */
function getProgressForCategory(
  category: Achievement["category"],
  stats: UserStats
): number {
  switch (category) {
    case "learning":
      return stats.total_lessons_completed;
    case "streak":
      return stats.longest_streak;
    case "mastery":
      return stats.total_xp;
    case "social":
      return 0;
  }
}

/**
 * Check achievement conditions and unlock any newly earned achievements.
 * Compares user stats against each achievement's max_progress threshold,
 * batch-upserts progress, and awards XP for newly unlocked achievements.
 * @param userId - UUID of the authenticated user
 * @returns Array of newly unlocked achievement records
 * @throws {NotFoundError} When user stats are not found
 */
export async function checkAndUnlockAchievements(
  userId: string
): Promise<Achievement[]> {
  const [statsResult, achievementsResult, existingResult] = await Promise.all([
    supabase.from("user_stats").select("*").eq("user_id", userId).single(),
    supabase.from("achievements").select("*"),
    supabase.from("user_achievements").select("*").eq("user_id", userId),
  ]);

  if (statsResult.error || !statsResult.data) {
    throw new NotFoundError("User stats");
  }

  const stats = statsResult.data as UserStats;
  const achievements = (achievementsResult.data ?? []) as Achievement[];
  const earnedSet = new Set(
    ((existingResult.data ?? []) as { achievement_id: string; earned: boolean }[])
      .filter((ua) => ua.earned)
      .map((ua) => ua.achievement_id)
  );

  const { upserts, newlyUnlocked } = buildAchievementUpserts(
    userId,
    achievements,
    earnedSet,
    stats
  );

  if (upserts.length > 0) {
    await supabase
      .from("user_achievements")
      .upsert(upserts, { onConflict: "user_id,achievement_id" });
  }

  if (newlyUnlocked.length > 0) {
    await awardAchievementXp(userId, newlyUnlocked);
  }

  return newlyUnlocked;
}

/** Build upsert rows and collect newly unlocked achievements. */
function buildAchievementUpserts(
  userId: string,
  achievements: Achievement[],
  earnedSet: Set<string>,
  stats: UserStats
): {
  upserts: {
    user_id: string;
    achievement_id: string;
    progress: number;
    earned: boolean;
    earned_at: string | null;
  }[];
  newlyUnlocked: Achievement[];
} {
  const upserts: {
    user_id: string;
    achievement_id: string;
    progress: number;
    earned: boolean;
    earned_at: string | null;
  }[] = [];
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of achievements) {
    if (earnedSet.has(achievement.id)) continue;

    const progress = getProgressForCategory(achievement.category, stats);
    const target = achievement.max_progress ?? 1;
    const earned = progress >= target;

    upserts.push({
      user_id: userId,
      achievement_id: achievement.id,
      progress: Math.min(progress, target),
      earned,
      earned_at: earned ? new Date().toISOString() : null,
    });

    if (earned) newlyUnlocked.push(achievement);
  }

  return { upserts, newlyUnlocked };
}

/** Award XP for newly unlocked achievements and log the event. */
async function awardAchievementXp(
  userId: string,
  unlocked: Achievement[]
): Promise<void> {
  const totalXp = unlocked.reduce((sum, a) => sum + a.xp_reward, 0);

  if (totalXp > 0) {
    const { data: current } = await supabase
      .from("user_stats")
      .select("total_xp")
      .eq("user_id", userId)
      .single();
    await supabase
      .from("user_stats")
      .update({ total_xp: (current?.total_xp ?? 0) + totalXp })
      .eq("user_id", userId);
  }

  logger.info("achievements_unlocked", {
    userId,
    count: unlocked.length,
    titles: unlocked.map((a) => a.title),
  });
}

export { updateStreakStats } from "./streak.service.js";
