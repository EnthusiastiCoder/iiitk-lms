import type { Metadata } from "next";
import { getAnalyticsData } from "@/actions/admin";
export const metadata: Metadata = {
  title: "Analytics | IIIT Kalyani LMS",
};
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart3, Users, BookOpen, Trophy, Zap } from "lucide-react";
import { Logger, safeFetch } from "@/lib/logger";

const log = new Logger("admin-analytics");

interface JoinedProfile {
  full_name: string;
  email?: string;
}

interface TopStudent {
  user_id: string;
  total_xp: number;
  level: number;
  profiles: JoinedProfile | JoinedProfile[] | null;
}

interface RecentSubmission {
  id: string;
  user_id: string;
  status: string;
  score: number | null;
  submitted_at: string | null;
  profiles: JoinedProfile | JoinedProfile[] | null;
}

export default async function AdminAnalyticsPage() {
  const defaultData = {
    userGrowth: [] as { month: string; count: number }[],
    courseEnrollments: [] as { title: string; count: number }[],
    maxEnrollment: 1,
    topStudents: [] as TopStudent[],
    recentSubmissions: [] as RecentSubmission[],
  };

  const result = await safeFetch(() => getAnalyticsData(), log);
  const data = result
    ? {
        ...result,
        topStudents: result.topStudents as TopStudent[],
        recentSubmissions: result.recentSubmissions as RecentSubmission[],
      }
    : defaultData;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Platform insights and statistics
          </p>
        </div>
        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: "rgba(255, 75, 75, 0.1)" }}
        >
          <BarChart3 className="h-5 w-5" style={{ color: "#FF4B4B" }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" style={{ color: "#FF4B4B" }} />
              User Growth by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.userGrowth.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No user data available.
              </p>
            ) : (
              <div className="space-y-2">
                {data.userGrowth.map((item) => (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">
                      {item.month}
                    </span>
                    <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md transition-all"
                        style={{
                          width: `${Math.max(
                            (item.count /
                              Math.max(
                                ...data.userGrowth.map((u) => u.count),
                                1
                              )) *
                              100,
                            5
                          )}%`,
                          backgroundColor: "#FF4B4B",
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Enrollment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" style={{ color: "#FF4B4B" }} />
              Course Enrollment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.courseEnrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No enrollment data available.
              </p>
            ) : (
              <div className="space-y-3">
                {data.courseEnrollments.map((course) => (
                  <div key={course.title}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="truncate mr-2">{course.title}</span>
                      <span className="font-medium shrink-0">
                        {course.count}
                      </span>
                    </div>
                    <div className="h-4 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md transition-all"
                        style={{
                          width: `${Math.max(
                            (course.count / data.maxEnrollment) * 100,
                            3
                          )}%`,
                          backgroundColor: "#FF4B4B",
                          opacity:
                            0.4 +
                            (course.count / data.maxEnrollment) * 0.6,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 10 Students by XP */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4" style={{ color: "#FF4B4B" }} />
              Top 10 Students by XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No student data available.
              </p>
            ) : (
              <div className="space-y-2">
                {data.topStudents.map((student: TopStudent, i: number) => {
                  const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;
                  return (
                    <div
                      key={student.user_id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span
                        className="text-sm font-bold w-6 text-center"
                        style={{
                          color:
                            i === 0
                              ? "#FFD700"
                              : i === 1
                                ? "#C0C0C0"
                                : i === 2
                                  ? "#CD7F32"
                                  : "#9CA3AF",
                        }}
                      >
                        #{i + 1}
                      </span>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback
                          className="text-xs font-bold"
                          style={{
                            backgroundColor: "rgba(255, 75, 75, 0.15)",
                            color: "#FF4B4B",
                          }}
                        >
                          {(profile?.full_name ?? "S").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {profile?.full_name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Level {student.level ?? 1}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: "rgba(255, 75, 75, 0.1)",
                          color: "#FF4B4B",
                        }}
                      >
                        <Zap className="h-3 w-3 mr-0.5" />
                        {(student.total_xp ?? 0).toLocaleString()}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" style={{ color: "#FF4B4B" }} />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 px-4">
                No submissions yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="p-3 font-medium">Student</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Score</th>
                      <th className="p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSubmissions.map(
                      (sub: RecentSubmission, i: number) => (
                        <tr
                          key={sub.id ?? i}
                          className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-3 text-sm">
                            {(Array.isArray(sub.profiles) ? sub.profiles[0]?.full_name : sub.profiles?.full_name) ?? "Unknown"}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                sub.status === "graded"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {sub.status ?? "pending"}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            {sub.score != null ? sub.score : "-"}
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">
                            {sub.submitted_at
                              ? new Date(
                                  sub.submitted_at
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
