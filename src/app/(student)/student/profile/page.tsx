import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserEnrollments, getUserCompletions, getCourses } from "@/actions/courses";

export const metadata: Metadata = {
  title: "Profile | IIIT Kalyani LMS",
};
import {
  User,
  Zap,
  BookOpen,
  Flame,
  Clock,
  Mail,
  Building2,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FadeIn } from "@/components/motion/fade-in";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";

const tierConfig: Record<string, { color: string; label: string }> = {
  bronze: { color: "var(--color-tier-bronze)", label: "Bronze" },
  silver: { color: "var(--color-tier-silver)", label: "Silver" },
  gold: { color: "var(--color-tier-gold)", label: "Gold" },
  diamond: { color: "var(--color-tier-diamond)", label: "Diamond" },
};

export default async function ProfilePage() {
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

  const { data: streakData } = await supabase
    .from("streak_log")
    .select("activity_date, xp_earned, lessons_completed")
    .eq("user_id", user!.id)
    .order("activity_date", { ascending: false })
    .limit(365);

  const [enrollments, completions, courses] = await Promise.all([
    getUserEnrollments(),
    getUserCompletions(),
    getCourses(),
  ]);

  const tier = tierConfig[stats?.tier ?? "bronze"] ?? tierConfig.bronze;
  const userName = profile?.full_name ?? "Student";
  const totalXp = stats?.total_xp ?? 0;
  const level = stats?.level ?? 1;
  const xpToNext = stats?.xp_to_next_level ?? 100;
  const xpPercent = xpToNext > 0 ? Math.min((totalXp / xpToNext) * 100, 100) : 0;
  const currentStreak = stats?.current_streak ?? 0;
  const longestStreak = stats?.longest_streak ?? 0;

  const courseMap = new Map(courses.map((c: any) => [c.id, c]));

  const enrolledCourses = enrollments.map((e: any) => {
    const course = courseMap.get(e.course_id);
    const courseCompletions = completions.filter(
      (c: any) => c.course_id === e.course_id
    );
    return {
      id: e.course_id,
      title: course?.title ?? "Unknown Course",
      completedLessons: courseCompletions.length,
    };
  });

  const statCards = [
    {
      label: "Total XP",
      value: totalXp.toLocaleString(),
      icon: Zap,
      color: "#58CC02",
    },
    {
      label: "Lessons Done",
      value: completions.length.toString(),
      icon: BookOpen,
      color: "#1899D6",
    },
    {
      label: "Current Streak",
      value: `${currentStreak}d`,
      icon: Flame,
      color: "#FF9600",
    },
    {
      label: "Longest Streak",
      value: `${longestStreak}d`,
      icon: Clock,
      color: "#A560E8",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      {/* Profile Header */}
      <FadeIn>
        <Card className="mb-6">
          <CardContent className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
            <Avatar className="h-20 w-20">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} />
              )}
              <AvatarFallback className="bg-brand/20 text-brand text-2xl font-bold">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{userName}</h1>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
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
                  <ProfileEditor
                    currentName={userName}
                    email={profile?.email ?? ""}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground mt-2">
                {profile?.email && (
                  <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <Mail className="h-3.5 w-3.5" />
                    {profile.email}
                  </span>
                )}
                {profile?.department && (
                  <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <Building2 className="h-3.5 w-3.5" />
                    {profile.department}
                  </span>
                )}
                {profile?.institution && (
                  <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {profile.institution}
                  </span>
                )}
              </div>

              <div className="mt-4 max-w-md mx-auto sm:mx-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    Level {level} Progress
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {totalXp}/{xpToNext} XP
                  </span>
                </div>
                <Progress value={xpPercent} className="h-2.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Stats Grid */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {statCards.map((stat) => (
            <Card key={stat.label} size="sm">
              <CardContent className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon
                    className="h-4 w-4"
                    style={{ color: stat.color }}
                  />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>

      {/* Activity Heatmap */}
      <FadeIn delay={0.15}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-streak" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap
              data={(streakData ?? []).map((d: any) => ({
                date: d.activity_date,
                xp: d.xp_earned,
                lessons: d.lessons_completed,
              }))}
            />
          </CardContent>
        </Card>
      </FadeIn>

      {/* Course Progress */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand" />
              Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.map((course: any) => (
                  <div key={course.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium truncate pr-4">
                        {course.title}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {course.completedLessons} lessons done
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(course.completedLessons * 10, 100)}%`,
                          backgroundColor: "#58CC02",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <User className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No courses enrolled yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
