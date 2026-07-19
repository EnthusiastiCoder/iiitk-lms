import { getClassStats } from "@/actions/professor";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, BarChart3, Settings } from "lucide-react";
import Link from "next/link";

export default async function CoursesManagementPage() {
  let courseStats: any[] = [];
  try {
    courseStats = await getClassStats();
  } catch {
    // No data
  }

  const totalStudents = courseStats.reduce((sum, c) => sum + c.enrolled, 0);
  const totalLessons = courseStats.reduce((sum, c) => sum + c.totalLessons, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground text-sm">
            Manage your courses and track student progress
          </p>
        </div>
        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: "rgba(28, 176, 246, 0.1)" }}
        >
          <BookOpen className="h-5 w-5" style={{ color: "#1CB0F6" }} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 pt-2">
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: "rgba(28, 176, 246, 0.1)" }}
            >
              <BookOpen className="h-5 w-5" style={{ color: "#1CB0F6" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{courseStats.length}</p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-2">
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: "rgba(28, 176, 246, 0.1)" }}
            >
              <Users className="h-5 w-5" style={{ color: "#1CB0F6" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-sm text-muted-foreground">Total Enrollments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-2">
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: "rgba(28, 176, 246, 0.1)" }}
            >
              <BarChart3 className="h-5 w-5" style={{ color: "#1CB0F6" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLessons}</p>
              <p className="text-sm text-muted-foreground">Total Lessons</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Grid */}
      {courseStats.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No courses found. Course data will appear here once courses are set up.
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
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="rounded-lg p-2 shrink-0"
                      style={{
                        backgroundColor: course.accentColor
                          ? `${course.accentColor}15`
                          : "rgba(28, 176, 246, 0.1)",
                      }}
                    >
                      <BookOpen
                        className="h-5 w-5"
                        style={{
                          color: course.accentColor || "#1CB0F6",
                        }}
                      />
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0"
                      style={{
                        backgroundColor: course.accentColor
                          ? `${course.accentColor}20`
                          : undefined,
                        color: course.accentColor || undefined,
                      }}
                    >
                      {course.enrolled} enrolled
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-2">
                    {course.courseTitle}
                  </CardTitle>
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
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Settings className="h-3 w-3" />
                    <span>Click to manage</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
