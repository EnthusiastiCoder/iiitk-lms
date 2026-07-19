import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getClassStats } from "@/actions/professor";

export const metadata: Metadata = {
  title: "Professor Dashboard | IIIT Kalyani LMS",
};
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default async function ProfessorDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  let courseStats: any[] = [];
  try {
    courseStats = await getClassStats();
  } catch {
    // No stats available
  }

  const totalStudents = courseStats.reduce((sum, c) => sum + c.enrolled, 0);
  const totalCourses = courseStats.length;
  const overallAvgProgress =
    totalCourses > 0
      ? Math.round(
          courseStats.reduce((sum, c) => sum + c.avgProgress, 0) / totalCourses
        )
      : 0;

  const userName = profile?.full_name ?? "Professor";

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-8 text-white"
        style={{
          background: "linear-gradient(135deg, #1CB0F6 0%, #0891D4 50%, #0670A8 100%)",
        }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Welcome back, {userName}
        </h1>
        <p className="text-white/80 text-sm sm:text-base">
          Here is an overview of your classes and student progress.
        </p>
        <div className="flex flex-wrap gap-6 mt-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCourses}</p>
              <p className="text-xs text-white/70">Courses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-xs text-white/70">Total Enrollments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overallAvgProgress}%</p>
              <p className="text-xs text-white/70">Avg Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/professor/students">
          <Card className="hover:ring-2 hover:ring-[#1CB0F6]/30 transition-all cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-1">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "rgba(28, 176, 246, 0.1)" }}
              >
                <Users className="h-5 w-5" style={{ color: "#1CB0F6" }} />
              </div>
              <div>
                <p className="font-semibold text-sm">Student Roster</p>
                <p className="text-xs text-muted-foreground">View all students</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/professor/grading">
          <Card className="hover:ring-2 hover:ring-[#1CB0F6]/30 transition-all cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-1">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "rgba(28, 176, 246, 0.1)" }}
              >
                <ClipboardCheck className="h-5 w-5" style={{ color: "#1CB0F6" }} />
              </div>
              <div>
                <p className="font-semibold text-sm">Grading Center</p>
                <p className="text-xs text-muted-foreground">Review submissions</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/professor/courses">
          <Card className="hover:ring-2 hover:ring-[#1CB0F6]/30 transition-all cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-1">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "rgba(28, 176, 246, 0.1)" }}
              >
                <BookOpen className="h-5 w-5" style={{ color: "#1CB0F6" }} />
              </div>
              <div>
                <p className="font-semibold text-sm">Manage Courses</p>
                <p className="text-xs text-muted-foreground">Course content</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Course Overview Cards */}
      <h2 className="text-lg font-semibold mb-4">Class Overview</h2>
      {courseStats.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No courses found. Course data will appear here once courses are available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courseStats.map((course) => (
            <Link
              key={course.courseId}
              href={`/professor/courses/${course.courseSlug}`}
            >
              <Card className="hover:ring-2 hover:ring-[#1CB0F6]/30 transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{course.courseTitle}</CardTitle>
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: course.accentColor
                          ? `${course.accentColor}20`
                          : undefined,
                        color: course.accentColor || undefined,
                      }}
                    >
                      {course.enrolled} students
                    </Badge>
                  </div>
                  <CardDescription>
                    {course.totalLessons} lessons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Avg progress</span>
                    <span className="font-medium">{course.avgProgress}%</span>
                  </div>
                  <Progress value={course.avgProgress} className="h-2" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
