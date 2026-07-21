"use server";

import { createClient } from "@/lib/supabase/server";
import { Logger } from "@/lib/logger";

const log = new Logger("achievements");
import type { LessonCompletion, Course } from "@/types/database";

export async function checkAndUnlockAchievements() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!stats) return [];

  const { data: completions } = await supabase
    .from("lesson_completions")
    .select("lesson_id, course_id")
    .eq("user_id", user.id);

  const { data: courses } = await supabase
    .from("courses")
    .select("id, total_lessons");

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score")
    .eq("user_id", user.id);

  type CompletionRow = Pick<LessonCompletion, "lesson_id" | "course_id">;
  type CourseRow = Pick<Course, "id" | "total_lessons">;
  type QuizAttemptRow = { quiz_id: string; score: number };

  const completedLessons = completions?.length ?? 0;
  const completedCourseIds = new Set<string>();
  const enrolledCourseIds = new Set((completions ?? []).map((c: CompletionRow) => c.course_id));

  for (const course of (courses ?? []) as CourseRow[]) {
    const courseCompletions = (completions ?? []).filter((c: CompletionRow) => c.course_id === course.id).length;
    if (courseCompletions >= course.total_lessons && course.total_lessons > 0) {
      completedCourseIds.add(course.id);
    }
  }

  const hasHighQuiz = (quizAttempts ?? []).some((a: QuizAttemptRow) => a.score >= 90);

  const checks: { id: string; earned: boolean; progress: number }[] = [
    { id: "ach-first-steps", earned: completedLessons >= 1, progress: Math.min(completedLessons, 1) },
    { id: "ach-bookworm", earned: completedLessons >= 10, progress: Math.min(completedLessons, 10) },
    { id: "ach-scholar", earned: completedLessons >= 25, progress: Math.min(completedLessons, 25) },
    { id: "ach-course-conqueror", earned: completedCourseIds.size >= 1, progress: completedCourseIds.size },
    { id: "ach-polymath", earned: enrolledCourseIds.size >= (courses?.length ?? 6), progress: enrolledCourseIds.size },
    { id: "ach-on-fire", earned: stats.current_streak >= 3, progress: Math.min(stats.current_streak, 3) },
    { id: "ach-consistent", earned: stats.current_streak >= 7, progress: Math.min(stats.current_streak, 7) },
    { id: "ach-dedicated", earned: stats.current_streak >= 14, progress: Math.min(stats.current_streak, 14) },
    { id: "ach-unstoppable", earned: stats.current_streak >= 30, progress: Math.min(stats.current_streak, 30) },
    { id: "ach-newcomer", earned: true, progress: 1 },
    { id: "ach-quiz-whiz", earned: hasHighQuiz, progress: hasHighQuiz ? 1 : 0 },
    { id: "ach-grand-master", earned: stats.level >= 25, progress: Math.min(stats.level, 25) },
  ];

  const newlyEarned: string[] = [];

  for (const check of checks) {
    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id, earned")
      .eq("user_id", user.id)
      .eq("achievement_id", check.id)
      .single();

    if (existing) {
      if (!existing.earned && check.earned) {
        await supabase
          .from("user_achievements")
          .update({ earned: true, progress: check.progress, earned_at: new Date().toISOString() })
          .eq("id", existing.id);
        log.info("unlock", { userId: user.id, achievementId: check.id });
        newlyEarned.push(check.id);
      } else if (existing.earned !== true) {
        await supabase
          .from("user_achievements")
          .update({ progress: check.progress })
          .eq("id", existing.id);
      }
    } else {
      await supabase.from("user_achievements").insert({
        user_id: user.id,
        achievement_id: check.id,
        progress: check.progress,
        earned: check.earned,
        earned_at: check.earned ? new Date().toISOString() : null,
      });
      if (check.earned) {
        log.info("unlock", { userId: user.id, achievementId: check.id });
        newlyEarned.push(check.id);
      }
    }
  }

  return newlyEarned;
}
