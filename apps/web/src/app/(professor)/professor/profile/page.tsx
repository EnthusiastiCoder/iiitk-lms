import type { Metadata } from "next";
import { serverFetch } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Professor Profile | IIIT Kalyani LMS",
};
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
  User,
  Mail,
  Building2,
  BookOpen,
  Users,
  BarChart3,
  GraduationCap,
} from "lucide-react";

interface ClassStat {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  accentColor: string;
  enrolled: number;
  avgProgress: number;
  totalLessons: number;
}

interface ProfileData {
  profile: {
    full_name: string | null;
    email: string;
    department?: string;
    institution?: string;
  };
}

export default async function ProfessorProfilePage() {
  const profileData = await serverFetch<ProfileData>("/profile");
  const courseStats = await serverFetch<ClassStat[]>("/professor/stats") ?? [];

  const totalStudents = courseStats.reduce((sum, c) => sum + c.enrolled, 0);
  const totalLessons = courseStats.reduce((sum, c) => sum + c.totalLessons, 0);
  const overallAvgProgress =
    courseStats.length > 0
      ? Math.round(
          courseStats.reduce((sum, c) => sum + c.avgProgress, 0) /
            courseStats.length
        )
      : 0;

  const userName = profileData?.profile?.full_name ?? "Professor";
  const email = profileData?.profile?.email ?? "";
  const department = profileData?.profile?.department ?? "Not specified";
  const institution = profileData?.profile?.institution ?? "IIIT Kalyani";

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center text-center pt-4">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback
                className="text-2xl font-bold"
                style={{
                  backgroundColor: "rgba(28, 176, 246, 0.15)",
                  color: "#1CB0F6",
                }}
              >
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-bold">{userName}</h2>
            <Badge
              className="mt-1"
              style={{
                backgroundColor: "rgba(28, 176, 246, 0.1)",
                color: "#1CB0F6",
              }}
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Professor
            </Badge>

            <div className="w-full mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{department}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{institution}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teaching Summary + Course Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Teaching Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Teaching Summary</CardTitle>
              <CardDescription>
                Overview of your teaching activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg border p-3 text-center">
                  <BookOpen className="h-5 w-5 mx-auto mb-1" style={{ color: "#1CB0F6" }} />
                  <p className="text-xl font-bold">{courseStats.length}</p>
                  <p className="text-xs text-muted-foreground">Courses</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <Users className="h-5 w-5 mx-auto mb-1" style={{ color: "#1CB0F6" }} />
                  <p className="text-xl font-bold">{totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Enrollments</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <BarChart3 className="h-5 w-5 mx-auto mb-1" style={{ color: "#1CB0F6" }} />
                  <p className="text-xl font-bold">{totalLessons}</p>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <GraduationCap className="h-5 w-5 mx-auto mb-1" style={{ color: "#1CB0F6" }} />
                  <p className="text-xl font-bold">{overallAvgProgress}%</p>
                  <p className="text-xs text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>
                Progress across your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courseStats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No course data available.
                </p>
              ) : (
                <div className="space-y-4">
                  {courseStats.map((course) => (
                    <div key={course.courseId}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium">{course.courseTitle}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {course.enrolled} students
                          </span>
                          <span className="font-medium">
                            {course.avgProgress}%
                          </span>
                        </div>
                      </div>
                      <Progress value={course.avgProgress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
