import type { Metadata } from "next";
import { serverFetch } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Admin Dashboard | IIIT Kalyani LMS",
};
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  Trophy,
  BarChart3,
  GraduationCap,
  Zap,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface SystemStats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalSubmissions: number;
  totalXp: number;
}

interface XpTransaction {
  id: string;
  xp_amount: number;
  source: string | null;
  description: string | null;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
}

export default async function AdminDashboard() {
  const defaultStats: SystemStats = {
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalSubmissions: 0,
    totalXp: 0,
  };
  const stats = await serverFetch<SystemStats>("/admin/stats") ?? defaultStats;
  const auditLog = await serverFetch<XpTransaction[]>("/admin/audit-log") ?? [];

  const recentActivity = auditLog.slice(0, 10);

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      label: "Courses",
      value: stats.totalCourses,
      icon: BookOpen,
    },
    {
      label: "Lessons",
      value: stats.totalLessons,
      icon: FileText,
    },
    {
      label: "Submissions",
      value: stats.totalSubmissions,
      icon: GraduationCap,
    },
    {
      label: "Total XP",
      value: stats.totalXp.toLocaleString(),
      icon: Zap,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-8 text-white"
        style={{
          background:
            "linear-gradient(135deg, #FF4B4B 0%, #E03E3E 50%, #C43030 100%)",
        }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-white/80 text-sm sm:text-base">
          System overview and management controls for IIIT Kalyani LMS.
        </p>
        <div className="flex flex-wrap gap-6 mt-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs text-white/70">Total Users</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalCourses}</p>
              <p className="text-xs text-white/70">Courses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.totalXp.toLocaleString()}
              </p>
              <p className="text-xs text-white/70">Total XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="rounded-lg p-1.5"
                  style={{ backgroundColor: "rgba(255, 75, 75, 0.1)" }}
                >
                  <stat.icon
                    className="h-4 w-4"
                    style={{ color: "#FF4B4B" }}
                  />
                </div>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/users">
          <Card className="hover:ring-2 hover:ring-[#FF4B4B]/30 transition-all cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-1">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "rgba(255, 75, 75, 0.1)" }}
              >
                <Users className="h-5 w-5" style={{ color: "#FF4B4B" }} />
              </div>
              <div>
                <p className="font-semibold text-sm">Manage Users</p>
                <p className="text-xs text-muted-foreground">
                  Roles and accounts
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/courses">
          <Card className="hover:ring-2 hover:ring-[#FF4B4B]/30 transition-all cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-1">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "rgba(255, 75, 75, 0.1)" }}
              >
                <BookOpen className="h-5 w-5" style={{ color: "#FF4B4B" }} />
              </div>
              <div>
                <p className="font-semibold text-sm">Manage Courses</p>
                <p className="text-xs text-muted-foreground">
                  Create and assign
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/achievements">
          <Card className="hover:ring-2 hover:ring-[#FF4B4B]/30 transition-all cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-1">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "rgba(255, 75, 75, 0.1)" }}
              >
                <Trophy className="h-5 w-5" style={{ color: "#FF4B4B" }} />
              </div>
              <div>
                <p className="font-semibold text-sm">Achievements</p>
                <p className="text-xs text-muted-foreground">
                  Badges and rewards
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/analytics">
          <Card className="hover:ring-2 hover:ring-[#FF4B4B]/30 transition-all cursor-pointer">
            <CardContent className="flex items-center gap-3 pt-1">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: "rgba(255, 75, 75, 0.1)" }}
              >
                <BarChart3 className="h-5 w-5" style={{ color: "#FF4B4B" }} />
              </div>
              <div>
                <p className="font-semibold text-sm">Analytics</p>
                <p className="text-xs text-muted-foreground">
                  Insights and data
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <h2 className="text-lg font-semibold mb-4">Recent XP Activity</h2>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">XP</th>
                  <th className="p-4 font-medium">Source</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No recent XP transactions.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((tx: XpTransaction, i: number) => (
                    <tr
                      key={tx.id ?? i}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4 text-sm">
                        {tx.profiles?.full_name ?? "Unknown"}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: "rgba(255, 75, 75, 0.1)",
                            color: "#FF4B4B",
                          }}
                        >
                          +{tx.xp_amount ?? 0} XP
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {tx.source ?? tx.description ?? "Activity"}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {tx.created_at
                          ? new Date(tx.created_at).toLocaleDateString()
                          : "-"}
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
