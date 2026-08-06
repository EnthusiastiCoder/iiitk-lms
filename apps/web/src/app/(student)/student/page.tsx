import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | IIIT Kalyani LMS",
};

import { serverFetch } from "@/lib/server-api";
import type {
  Profile,
  UserStats,
  Enrollment,
  LessonCompletion,
  Course,
} from "@lms/shared";
import {
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { tierConfig } from "@/lib/tiers";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { WeeklyXpChart } from "@/components/dashboard/WeeklyXpChart";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function StudentDashboard() {
  const [profileData, enrollments, completions, courses, weeklyXpData, leaderboard] =
    await Promise.all([
      serverFetch<{ profile: Profile; stats: UserStats }>("/profile"),
      serverFetch<Enrollment[]>("/enrollments"),
      serverFetch<LessonCompletion[]>("/enrollments/completions"),
      serverFetch<Course[]>("/courses"),
      serverFetch<{ date: string; xp: number }[]>("/gamification/weekly-xp"),
      serverFetch<{ userId: string; rank: number }[]>("/gamification/leaderboard"),
    ]);

  const profile = profileData?.profile ?? null;
  const stats = profileData?.stats ?? null;
  const safeEnrollments = enrollments ?? [];
  const safeCompletions = completions ?? [];
  const safeCourses = courses ?? [];
  const weeklyXp =
    weeklyXpData && weeklyXpData.length > 0
      ? weeklyXpData.map((d) => d.xp)
      : [0, 0, 0, 0, 0, 0, 0];

  // Compute rank from leaderboard
  const userId = profile?.id;
  const leaderboardEntry = leaderboard?.find((e) => e.userId === userId);
  const rank = leaderboardEntry?.rank ?? (leaderboard?.length ?? 0) + 1;

  const userName = profile?.full_name ?? "Student";
  const firstName = userName.split(" ")[0];
  const totalXp = stats?.total_xp ?? 0;
  const level = stats?.level ?? 1;
  const xpToNext = stats?.xp_to_next_level ?? 100;
  const xpPercent =
    xpToNext > 0 ? Math.min((totalXp / xpToNext) * 100, 100) : 0;
  const currentStreak = stats?.current_streak ?? 0;
  const tier = tierConfig[stats?.tier ?? "bronze"] ?? tierConfig.bronze;

  const courseMap = new Map(safeCourses.map((c: Course) => [c.id, c]));

  const enrolledCourses = safeEnrollments.map((e: Enrollment) => {
    const course = courseMap.get(e.course_id);
    const courseCompletions = safeCompletions.filter(
      (c: LessonCompletion) => c.course_id === e.course_id
    );
    return {
      id: e.course_id,
      slug: course?.slug,
      title: course?.title ?? "Unknown Course",
      description: course?.description,
      completedLessons: courseCompletions.length,
      enrolledAt: e.enrolled_at,
    };
  });

  const weeklyMax = Math.max(...weeklyXp, 1);
  const weeklyTotal = weeklyXp.reduce((a: number, b: number) => a + b, 0);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      {/* Welcome Banner */}
      <WelcomeBanner
        greeting={greeting}
        firstName={firstName}
        tier={{ label: tier.label, color: tier.color }}
        level={level}
        currentStreak={currentStreak}
        totalXp={totalXp}
        xpToNext={xpToNext}
        xpPercent={xpPercent}
      />

      {/* Quick Stats */}
      <StatsGrid
        lessonsDone={safeCompletions.length.toString()}
        totalXp={totalXp.toLocaleString()}
        dayStreak={currentStreak.toString()}
        rank={`#${rank}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <FadeIn delay={0.15}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Continue Learning</h2>
              <Link
                href="/student/courses"
                className="text-sm text-brand hover:underline flex items-center gap-0.5"
              >
                All courses
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={
                      course.slug
                        ? `/student/courses/${course.slug}`
                        : "/student/courses"
                    }
                  >
                    <Card className="hover:ring-brand/30 transition-all hover:scale-[1.01]">
                      <CardContent className="pt-1">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="font-semibold text-sm truncate">
                            {course.title}
                          </p>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                        {course.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                            {course.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    course.completedLessons * 10,
                                    100
                                  )}%`,
                                  backgroundColor: "#58CC02",
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {course.completedLessons} lessons
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-muted-foreground">
                    No courses enrolled yet.
                  </p>
                  <Link
                    href="/student/courses"
                    className="inline-block mt-3 text-sm text-brand hover:underline"
                  >
                    Browse courses
                  </Link>
                </CardContent>
              </Card>
            )}
          </FadeIn>
        </div>

        {/* Weekly XP Chart */}
        <div>
          <WeeklyXpChart
            weeklyXp={weeklyXp}
            weeklyTotal={weeklyTotal}
            weeklyMax={weeklyMax}
            dayLabels={dayLabels}
          />
        </div>
      </div>
    </div>
  );
}
