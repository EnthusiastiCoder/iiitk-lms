import type { Metadata } from "next";
import { getStudentRoster } from "@/actions/professor";

export const metadata: Metadata = {
  title: "Students | IIIT Kalyani LMS",
};
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Search } from "lucide-react";
import Link from "next/link";
import { StudentSearch } from "@/components/professor/StudentSearch";
import { Logger, safeFetch } from "@/lib/logger";
import type { Profile, UserStats } from "@/types/database";

const log = new Logger("professor-students");

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const page = parseInt(params.page ?? "0", 10);
  const pageSize = 20;

  const result = await safeFetch(() => getStudentRoster({ search, page, pageSize }), log);
  const students = result?.students ?? [];
  const total = result?.total ?? 0;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground text-sm">
            {total} student{total !== 1 ? "s" : ""} enrolled
          </p>
        </div>
        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: "rgba(28, 176, 246, 0.1)" }}
        >
          <Users className="h-5 w-5" style={{ color: "#1CB0F6" }} />
        </div>
      </div>

      {/* Search */}
      <StudentSearch initialSearch={search} />

      {/* Student Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Level</th>
                  <th className="p-4 font-medium">XP</th>
                  <th className="p-4 font-medium hidden md:table-cell">Tier</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Streak</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      {search
                        ? "No students found matching your search."
                        : "No students enrolled yet."}
                    </td>
                  </tr>
                ) : (
                  students.map((student: Profile & { user_stats: UserStats[] | UserStats | null }) => {
                    const rawStats = student.user_stats;
                    const stats = Array.isArray(rawStats) ? rawStats[0] : rawStats;
                    return (
                      <tr
                        key={student.id}
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            href={`/professor/students/${student.id}`}
                            className="flex items-center gap-3 hover:underline"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback
                                className="text-xs font-bold"
                                style={{
                                  backgroundColor: "rgba(28, 176, 246, 0.15)",
                                  color: "#1CB0F6",
                                }}
                              >
                                {(student.full_name ?? "S").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {student.full_name ?? "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {student.email}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="p-4 text-sm hidden sm:table-cell">
                          {stats?.level ?? 1}
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {stats?.total_xp ?? 0}
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <Badge variant="secondary" className="text-xs">
                            {stats?.tier ?? "Bronze"}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm hidden sm:table-cell">
                          {stats?.current_streak ?? 0} days
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 0 && (
            <Link
              href={`/professor/students?page=${page - 1}${search ? `&search=${search}` : ""}`}
              className="px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground px-3">
            Page {page + 1} of {totalPages}
          </span>
          {page < totalPages - 1 && (
            <Link
              href={`/professor/students?page=${page + 1}${search ? `&search=${search}` : ""}`}
              className="px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
