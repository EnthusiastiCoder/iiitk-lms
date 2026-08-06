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
import { Logger, safeFetch } from "@/lib/logger";

const log = new Logger("student-dashboard");
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

  const [_enrollments, _completions, _courses, _weeklyXp] = await Promise.all([
    safeFetch(() => getUserEnrollments(), log),
    safeFetch(() => getUserCompletions(), log),
    safeFetch(() => getCourses(), log),
    safeFetch(() => getWeeklyXp(), log),
  ]);
  const enrollments = _enrollments ?? [];
  const completions = _completions ?? [];
  const courses = _courses ?? [];
  const weeklyXp = _weeklyXp ?? [0, 0, 0, 0, 0, 0, 0];

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

  interface CourseRow { id: string; slug: string; title: string; description: string; [key: string]: unknown }
  interface EnrollmentRow { course_id: string; enrolled_at: string; [key: string]: unknown }
  interface CompletionRow { course_id: string; lesson_id: string; [key: string]: unknown }

  const courseMap = new Map(courses.map((c: CourseRow) => [c.id, c]));

  const enrolledCourses = enrollments.map((e: EnrollmentRow) => {
    const course = courseMap.get(e.course_id);
    const courseCompletions = completions.filter(
      (c: CompletionRow) => c.course_id === e.course_id
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
        lessonsDone={completions.length.toString()}
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
