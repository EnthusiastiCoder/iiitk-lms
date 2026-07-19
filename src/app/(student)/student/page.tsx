import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | IIIT Kalyani LMS",
};
import { createClient } from "@/lib/supabase/server";
import {
  getUserEnrollments,
  getUserCompletions,
  getCourses,
} from "@/actions/courses";
import { getWeeklyXp } from "@/actions/gamification";
import {
  Zap,
  BookOpen,
  Flame,
  TrendingUp,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FadeIn } from "@/components/motion/fade-in";

const tierConfig: Record<string, { color: string; label: string }> = {
  bronze: { color: "var(--color-tier-bronze)", label: "Bronze" },
  silver: { color: "var(--color-tier-silver)", label: "Silver" },
  gold: { color: "var(--color-tier-gold)", label: "Gold" },
  diamond: { color: "var(--color-tier-diamond)", label: "Diamond" },
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function StudentDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const [enrollments, completions, courses, weeklyXp] = await Promise.all([
    getUserEnrollments(),
    getUserCompletions(),
    getCourses(),
    getWeeklyXp(),
  ]);

  // Compute rank (count users with more XP)
  const { count: usersAbove } = await supabase
    .from("user_stats")
    .select("*", { count: "exact", head: true })
    .gt("total_xp", stats?.total_xp ?? 0);

  const rank = (usersAbove ?? 0) + 1;

  const userName = profile?.full_name ?? "Student";
  const firstName = userName.split(" ")[0];
  const totalXp = stats?.total_xp ?? 0;
  const level = stats?.level ?? 1;
  const xpToNext = stats?.xp_to_next_level ?? 100;
  const xpPercent =
    xpToNext > 0 ? Math.min((totalXp / xpToNext) * 100, 100) : 0;
  const currentStreak = stats?.current_streak ?? 0;
  const tier = tierConfig[stats?.tier ?? "bronze"] ?? tierConfig.bronze;

  const courseMap = new Map(courses.map((c: any) => [c.id, c]));

  const enrolledCourses = enrollments.map((e: any) => {
    const course = courseMap.get(e.course_id);
    const courseCompletions = completions.filter(
      (c: any) => c.course_id === e.course_id
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

  const statCards = [
    {
      label: "Lessons Done",
      value: completions.length.toString(),
      icon: BookOpen,
      color: "#58CC02",
    },
    {
      label: "Total XP",
      value: totalXp.toLocaleString(),
      icon: Zap,
      color: "#1899D6",
    },
    {
      label: "Day Streak",
      value: currentStreak.toString(),
      icon: Flame,
      color: "#FF9600",
    },
    {
      label: "Rank",
      value: `#${rank}`,
      icon: TrendingUp,
      color: "#A560E8",
    },
  ];

  const weeklyMax = Math.max(...weeklyXp, 1);
  const weeklyTotal = weeklyXp.reduce((a: number, b: number) => a + b, 0);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      {/* Welcome Banner */}
      <FadeIn>
        <Card className="mb-6 overflow-hidden">
          <CardContent className="relative pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{greeting},</p>
                <h1 className="text-2xl font-bold mt-0.5">{firstName}!</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    style={{
                      color: tier.color,
                      borderColor: `${tier.color}40`,
                    }}
                  >
                    {tier.label}
                  </Badge>
                  <Badge variant="secondary">Level {level}</Badge>
                  {currentStreak > 0 && (
                    <span className="flex items-center gap-1 text-streak text-sm font-bold">
                      <Flame className="h-4 w-4 animate-streak" />
                      {currentStreak}
                    </span>
                  )}
                </div>
              </div>
              <div className="sm:text-right">
                <div className="flex items-center gap-2 sm:justify-end mb-1">
                  <span className="text-xs text-muted-foreground">
                    Level {level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {totalXp}/{xpToNext} XP
                  </span>
                </div>
                <div className="w-full sm:w-48">
                  <Progress value={xpPercent} className="h-2.5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Quick Stats */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {statCards.map((stat) => (
            <Card key={stat.label} size="sm">
              <CardContent className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl shrink-0"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon
                    className="h-4 w-4"
                    style={{ color: stat.color }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>

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
          <FadeIn delay={0.2}>
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-brand" />
                    Weekly XP
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {weeklyTotal} XP
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-1.5 h-32">
                  {weeklyXp.map((xp: number, i: number) => {
                    const height =
                      weeklyMax > 0 ? (xp / weeklyMax) * 100 : 0;
                    const isToday =
                      new Date().getDay() === (i === 6 ? 0 : i + 1);

                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {xp > 0 ? xp : ""}
                        </span>
                        <div className="w-full flex items-end justify-center h-20">
                          <div
                            className="w-full max-w-8 rounded-t-md transition-all"
                            style={{
                              height: `${Math.max(height, 4)}%`,
                              backgroundColor: isToday
                                ? "#58CC02"
                                : xp > 0
                                  ? "rgba(88, 204, 2, 0.3)"
                                  : "var(--color-muted)",
                            }}
                          />
                        </div>
                        <span
                          className={`text-[10px] ${
                            isToday
                              ? "text-brand font-bold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {dayLabels[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href="/student/achievements">
                <Card
                  size="sm"
                  className="hover:ring-brand/30 transition-all hover:scale-[1.02]"
                >
                  <CardContent className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-streak" />
                    <span className="text-sm font-medium">Achievements</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/student/leaderboard">
                <Card
                  size="sm"
                  className="hover:ring-brand/30 transition-all hover:scale-[1.02]"
                >
                  <CardContent className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-brand" />
                    <span className="text-sm font-medium">Leaderboard</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
