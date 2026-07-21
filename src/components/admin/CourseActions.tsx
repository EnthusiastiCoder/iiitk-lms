"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignInstructor, deleteCourse } from "@/actions/admin";
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

export function CourseActions({
  courseId,
  courseTitle,
  currentInstructorId,
  professors,
}: {
  courseId: string;
  courseTitle: string;
  currentInstructorId: string | null;
  professors: { id: string; full_name: string; email: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  const handleInstructorChange = (professorId: string) => {
    if (professorId === currentInstructorId) return;
    startTransition(async () => {
      try {
        await assignInstructor(courseId, professorId);
        router.refresh();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to assign instructor");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCourse(courseId);
        setDeleteOpen(false);
        router.refresh();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Failed to delete course");
      }
    });
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1">
        <label className="text-xs text-muted-foreground mb-1 block">
          Instructor
        </label>
        <Select
          value={currentInstructorId ?? "unassigned"}
          onValueChange={(v) => {
            if (v && v !== "unassigned") handleInstructorChange(v);
          }}
          disabled={isPending}
        >
          <SelectTrigger className="w-full h-7 text-xs">
            <SelectValue placeholder="Assign instructor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned" disabled>
              Unassigned
            </SelectItem>
            {professors.map((prof) => (
              <SelectItem key={prof.id} value={prof.id}>
                {prof.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4">
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
              <DialogTitle>Delete Course</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <strong>{courseTitle}</strong>? This will remove all
                associated lessons, enrollments, and submissions. This
                action cannot be undone.
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
                {isPending ? "Deleting..." : "Delete Course"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
