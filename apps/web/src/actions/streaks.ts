"use server";

import { createClient } from "@/lib/supabase/server";
import { Logger } from "@/lib/logger";

const log = new Logger("streaks");

export async function updateStreakStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  log.info("streak.calculate", { userId: user.id });

  const { data: streakDays } = await supabase
    .from("streak_log")
    .select("activity_date")
    .eq("user_id", user.id)
    .order("activity_date", { ascending: false })
    .limit(365);

  if (!streakDays || streakDays.length === 0) return;

  const dates = streakDays.map((d: { activity_date: string }) => d.activity_date);
  const today = new Date().toISOString().slice(0, 10);

  let currentStreak = 0;
  const checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (dates.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDates = [...dates].sort();

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  await supabase
    .from("user_stats")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
}
