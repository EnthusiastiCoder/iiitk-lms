import { supabase } from "../../db/supabase.js";
import { Logger } from "../../utils/logger.js";
import type { Achievement } from "@lms/shared";

const logger = new Logger("admin.achievements");

interface CreateAchievementData {
  title: string;
  description: string;
  icon: string;
  category: "learning" | "streak" | "social" | "mastery";
  rarity: "common" | "rare" | "epic" | "legendary";
  xp_reward: number;
  condition_description: string | null;
  max_progress: number | null;
}

/**
 * Get all achievements.
 * @returns Array of all achievements
 * @throws Error if database query fails
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("category", { ascending: true });

  if (error) {
    logger.error("get_all_achievements_failed", error);
    throw error;
  }

  logger.info("achievements_fetched", { count: data?.length ?? 0 });
  return (data ?? []) as Achievement[];
}

/**
 * Create a new achievement.
 * @param data - Achievement data
 * @returns The created achievement
 * @throws Error if insert fails
 */
export async function createAchievement(
  data: CreateAchievementData
): Promise<Achievement> {
  const { data: achievement, error } = await supabase
    .from("achievements")
    .insert(data)
    .select()
    .single();

  if (error) {
    logger.error("create_achievement_failed", error);
    throw error;
  }

  logger.info("achievement_created", { achievementId: achievement.id });
  return achievement as Achievement;
}
