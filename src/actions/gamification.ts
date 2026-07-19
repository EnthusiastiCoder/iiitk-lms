"use server";

import { createClient } from "@/lib/supabase/server";

export async function getLeaderboard() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_stats")
    .select("user_id, total_xp, level, tier, current_streak")
    .order("total_xp", { ascending: false })
    .limit(50);

  if (!data || data.length === 0) return [];

  const userIds = data.map((s: any) => s.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  return data.map((s: any, i: number) => {
    const profile = profileMap.get(s.user_id);
    return {
      rank: i + 1,
      userId: s.user_id,
      name: profile?.full_name ?? "Unknown",
      username: profile?.username ?? "",
      avatarUrl: profile?.avatar_url ?? "",
      xp: s.total_xp,
      level: s.level,
      tier: s.tier,
      streak: s.current_streak,
    };
  });
}

export async function getUserAchievements() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { achievements: [], userAchievements: [] };

  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("category");

  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", user.id);

  return {
    achievements: achievements ?? [],
    userAchievements: userAchievements ?? [],
  };
}

export async function getStreakData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data } = await supabase
    .from("streak_log")
    .select("*")
    .eq("user_id", user.id)
    .gte("activity_date", thirtyDaysAgo.toISOString().slice(0, 10))
    .order("activity_date", { ascending: false });

  return data ?? [];
}

export async function getWeeklyXp() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [0, 0, 0, 0, 0, 0, 0];

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

  const { data } = await supabase
    .from("xp_transactions")
    .select("amount, created_at")
    .eq("user_id", user.id)
    .gte("created_at", weekStart.toISOString());

  const weekly = [0, 0, 0, 0, 0, 0, 0];
  (data ?? []).forEach((tx: any) => {
    const day = new Date(tx.created_at).getDay();
    const idx = day === 0 ? 6 : day - 1;
    weekly[idx] += tx.amount;
  });

  return weekly;
}
