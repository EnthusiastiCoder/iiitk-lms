"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getLessonContent(lessonId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error) return null;
  return data;
}

export async function completeLesson(lessonId: string, courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("lesson_completions")
    .select("id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .single();

  if (existing) return { already: true, xpEarned: 0 };

  const { data: lesson } = await supabase
    .from("lessons")
    .select("xp_reward")
    .eq("id", lessonId)
    .single();

  const xp = lesson?.xp_reward ?? 50;

  await supabase.from("lesson_completions").insert({
    user_id: user.id,
    lesson_id: lessonId,
    course_id: courseId,
    xp_earned: xp,
  });

  await supabase.from("xp_transactions").insert({
    user_id: user.id,
    amount: xp,
    source_type: "lesson",
    source_id: lessonId,
    description: `Completed lesson`,
  });

  const { data: stats } = await supabase
    .from("user_stats")
    .select("total_xp, level, total_lessons_completed")
    .eq("user_id", user.id)
    .single();

  if (stats) {
    const newXp = stats.total_xp + xp;
    const newLevel = Math.floor(newXp / 500) + 1;
    const tier = newLevel < 8 ? "bronze" : newLevel < 15 ? "silver" : newLevel < 22 ? "gold" : "diamond";

    await supabase
      .from("user_stats")
      .update({
        total_xp: newXp,
        level: newLevel,
        xp_to_next_level: newLevel * 500,
        tier,
        total_lessons_completed: stats.total_lessons_completed + 1,
        last_activity_date: new Date().toISOString().slice(0, 10),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: streakEntry } = await supabase
    .from("streak_log")
    .select("*")
    .eq("user_id", user.id)
    .eq("activity_date", today)
    .single();

  if (streakEntry) {
    await supabase
      .from("streak_log")
      .update({
        lessons_completed: streakEntry.lessons_completed + 1,
        xp_earned: streakEntry.xp_earned + xp,
      })
      .eq("id", streakEntry.id);
  } else {
    await supabase.from("streak_log").insert({
      user_id: user.id,
      activity_date: today,
      lessons_completed: 1,
      xp_earned: xp,
    });
  }

  revalidatePath("/student");
  revalidatePath(`/student/courses`);

  return { already: false, xpEarned: xp };
}
