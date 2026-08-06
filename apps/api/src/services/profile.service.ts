import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import type {
  Profile,
  UserStats,
  StreakLog,
  Enrollment,
} from "@lms/shared";

const logger = new Logger("profile.service");

/**
 * Get a user's full profile with stats, recent streak history, enrollments, and lesson count.
 * @param userId - UUID of the authenticated user
 * @returns Assembled profile object with all related data
 * @throws {NotFoundError} When the profile does not exist
 */
export async function getFullProfile(userId: string): Promise<{
  profile: Profile;
  stats: UserStats;
  streakLog: StreakLog[];
  enrollments: Enrollment[];
  lessonsCompleted: number;
}> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().split("T")[0];

  const [profileResult, statsResult, streakResult, enrollResult, lessonResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_stats").select("*").eq("user_id", userId).single(),
      supabase
        .from("streak_log")
        .select("*")
        .eq("user_id", userId)
        .gte("activity_date", cutoff)
        .order("activity_date", { ascending: false }),
      supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false }),
      supabase
        .from("lesson_completions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

  if (profileResult.error || !profileResult.data) {
    throw new NotFoundError("Profile");
  }

  logger.info("full_profile_fetched", { userId });

  return {
    profile: profileResult.data as Profile,
    stats: (statsResult.data ?? {}) as UserStats,
    streakLog: (streakResult.data ?? []) as StreakLog[],
    enrollments: (enrollResult.data ?? []) as Enrollment[],
    lessonsCompleted: lessonResult.count ?? 0,
  };
}

/**
 * Update a user's display name.
 * @param userId - UUID of the authenticated user
 * @param fullName - New full name value
 * @returns The updated profile record
 * @throws {BadRequestError} When the update fails
 */
export async function updateProfile(
  userId: string,
  fullName: string
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) {
    logger.error("profile_update_failed", error ?? new Error("No data"), {
      userId,
    });
    throw new BadRequestError(error?.message ?? "Failed to update profile");
  }

  logger.info("profile_updated", { userId });
  return data as Profile;
}
