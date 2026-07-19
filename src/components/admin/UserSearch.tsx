"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserSearch({
  initialSearch,
  initialRole,
}: {
  initialSearch: string;
  initialRole: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState(initialRole);
  const router = useRouter();

  const navigate = (s: string, r: string) => {
    const params = new URLSearchParams();
    if (s) params.set("search", s);
    if (r && r !== "all") params.set("role", r);
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(search, role);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    navigate(search, value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-4">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="professor">Professor</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
}
