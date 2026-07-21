import { getStudentDetail } from "@/actions/professor";
import { getCourses } from "@/actions/courses";
import type { Course } from "@/types/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Trophy,
  Flame,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { Logger, safeFetch } from "@/lib/logger";

const log = new Logger("professor-student-detail");

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const detail = await safeFetch(() => getStudentDetail(studentId), log);
  const allCourses = await safeFetch(() => getCourses(), log) ?? [];

  if (!detail?.profile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <Link
          href="/professor/students"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Student not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, stats, enrolledCourseIds, completions, quizAttempts } = detail;
  const enrolledCourses = allCourses.filter((c: Course) =>
    enrolledCourseIds.includes(c.id)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      {/* Back link */}
      <Link
        href="/professor/students"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </Link>

      {/* Student Header */}
      <Card className="mb-6">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
          <Avatar className="h-16 w-16">
            <AvatarFallback
              className="text-xl font-bold"
              style={{
                backgroundColor: "rgba(28, 176, 246, 0.15)",
                color: "#1CB0F6",
              }}
            >
              {(profile.full_name ?? "S").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{profile.full_name ?? "Unknown"}</h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            {profile.department && (
              <p className="text-sm text-muted-foreground">{profile.department}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <Trophy className="h-4 w-4" style={{ color: "#1CB0F6" }} />
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="font-semibold text-sm">{stats?.level ?? 1}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <GraduationCap className="h-4 w-4" style={{ color: "#1CB0F6" }} />
              <div>
                <p className="text-xs text-muted-foreground">XP</p>
                <p className="font-semibold text-sm">{stats?.total_xp ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="font-semibold text-sm">{stats?.current_streak ?? 0}d</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Progress */}
      <h2 className="text-lg font-semibold mb-4">Course Progress</h2>
      {enrolledCourses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            This student is not enrolled in any courses.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {enrolledCourses.map((course: Course) => {
            const courseCompletions = completions.filter(
              (c: { course_id: string }) => c.course_id === course.id
            );
            const progress =
              course.total_lessons > 0
                ? Math.round(
                    (courseCompletions.length / course.total_lessons) * 100
                  )
                : 0;

            return (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    <Badge variant="secondary">{progress}%</Badge>
                  </div>
                  <CardDescription>
                    {courseCompletions.length} / {course.total_lessons} lessons
                    completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quiz Scores */}
      <h2 className="text-lg font-semibold mb-4">Recent Quiz Scores</h2>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-4 font-medium">Quiz ID</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {quizAttempts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No quiz attempts yet.
                    </td>
                  </tr>
                ) : (
                  quizAttempts.slice(0, 10).map((attempt: { quiz_id: string; score: number; completed_at: string }, i: number) => (
                    <tr
                      key={`${attempt.quiz_id}-${i}`}
                      className="border-b last:border-0"
                    >
                      <td className="p-4 text-sm font-mono">
                        {attempt.quiz_id?.slice(0, 8) ?? "N/A"}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            (attempt.score ?? 0) >= 80
                              ? "default"
                              : (attempt.score ?? 0) >= 50
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {attempt.score ?? 0}%
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {attempt.completed_at
                          ? new Date(attempt.completed_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
