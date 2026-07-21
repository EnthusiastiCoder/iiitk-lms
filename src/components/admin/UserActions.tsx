"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole, deleteUser } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export function UserActions({
  userId,
  userName,
  currentRole,
}: {
  userId: string;
  userName: string;
  currentRole: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  const handleRoleChange = (newRole: string) => {
    if (newRole === currentRole) return;
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        router.refresh();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to update role");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteUser(userId);
        setDeleteOpen(false);
        router.refresh();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to delete user");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentRole} onValueChange={(v: string | null) => { if (v) handleRoleChange(v); }} disabled={isPending}>
        <SelectTrigger className="w-[110px] h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="professor">Professor</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger
          render={
            <Button
              variant="destructive"
              size="icon-sm"
              disabled={isPending}
            />
          }
        >
          <Trash2 className="h-3.5 w-3.5" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{userName}</strong>? This
              action cannot be undone. All associated data will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
