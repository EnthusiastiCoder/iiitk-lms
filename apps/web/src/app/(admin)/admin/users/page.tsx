import type { Metadata } from "next";
import { serverFetch } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "User Management | IIIT Kalyani LMS",
};
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Shield } from "lucide-react";
import Link from "next/link";
import { UserSearch } from "@/components/admin/UserSearch";
import { UserActions } from "@/components/admin/UserActions";
import type { Profile, UserStats } from "@/types/database";

interface PaginatedUsers {
  items: Array<Profile & { user_stats: UserStats[] | UserStats | null }>;
  total: number;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const role = params.role ?? "all";
  const page = parseInt(params.page ?? "0", 10);
  const pageSize = 20;

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (role !== "all") query.set("role", role);
  query.set("page", String(page));
  query.set("limit", String(pageSize));

  const result = await serverFetch<PaginatedUsers>(`/admin/users?${query.toString()}`);
  const users = result?.items ?? [];
  const total = result?.total ?? 0;

  const totalPages = Math.ceil(total / pageSize);

  const roleBadgeColor = (r: string) => {
    switch (r) {
      case "admin":
        return { bg: "rgba(255, 75, 75, 0.1)", color: "#FF4B4B" };
      case "professor":
        return { bg: "rgba(28, 176, 246, 0.1)", color: "#1CB0F6" };
      default:
        return { bg: "rgba(88, 204, 2, 0.1)", color: "#58CC02" };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">
            {total} user{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: "rgba(255, 75, 75, 0.1)" }}
        >
          <Shield className="h-5 w-5" style={{ color: "#FF4B4B" }} />
        </div>
      </div>

      {/* Search and Filter */}
      <UserSearch initialSearch={search} initialRole={role} />

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Level</th>
                  <th className="p-4 font-medium">XP</th>
                  <th className="p-4 font-medium">Joined</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      {search
                        ? "No users found matching your search."
                        : "No users found."}
                    </td>
                  </tr>
                ) : (
                  users.map((user: Profile & { user_stats: UserStats[] | UserStats | null }) => {
                    const rawStats = user.user_stats;
                    const stats = Array.isArray(rawStats) ? rawStats[0] : rawStats;
                    const colors = roleBadgeColor(user.role);
                    return (
                      <tr
                        key={user.id}
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback
                                className="text-xs font-bold"
                                style={{
                                  backgroundColor: colors.bg,
                                  color: colors.color,
                                }}
                              >
                                {(user.full_name ?? "U").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {user.full_name ?? "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: colors.bg,
                              color: colors.color,
                            }}
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">
                          {stats?.level ?? 1}
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {stats?.total_xp ?? 0}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="p-4">
                          <UserActions
                            userId={user.id}
                            userName={user.full_name ?? "Unknown"}
                            currentRole={user.role}
                          />
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
              href={`/admin/users?page=${page - 1}${search ? `&search=${search}` : ""}${role !== "all" ? `&role=${role}` : ""}`}
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
              href={`/admin/users?page=${page + 1}${search ? `&search=${search}` : ""}${role !== "all" ? `&role=${role}` : ""}`}
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
