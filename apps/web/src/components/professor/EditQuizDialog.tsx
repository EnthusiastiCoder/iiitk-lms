"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { professor } from "@/lib/api";

interface EditQuizDialogProps {
  quizId: string;
  currentTitle: string;
  currentDescription: string;
  currentTimeLimit: number;
  currentXpReward: number;
}

export function EditQuizDialog({
  quizId,
  currentTitle,
  currentDescription,
  currentTimeLimit,
  currentXpReward,
}: EditQuizDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [timeLimit, setTimeLimit] = useState(currentTimeLimit || 10);
  const [xpReward, setXpReward] = useState(currentXpReward || 50);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTitle(currentTitle);
      setDescription(currentDescription);
      setTimeLimit(currentTimeLimit || 10);
      setXpReward(currentXpReward || 50);
      setError(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await professor.updateQuiz(quizId, {
          title: title.trim(),
          description: description.trim(),
          timeLimit,
          xpReward,
        });
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update quiz"
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="icon-xs" />}>
        <Pencil className="h-3 w-3" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
          <DialogDescription>
            Update the quiz details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="edit-quiz-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="edit-quiz-title"
              placeholder="Quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="edit-quiz-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="edit-quiz-description"
              placeholder="Brief description of this quiz"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="edit-quiz-time-limit" className="text-sm font-medium">
                Time Limit (minutes)
              </label>
              <Input
                id="edit-quiz-time-limit"
                type="number"
                min={1}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                disabled={isPending}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-quiz-xp" className="text-sm font-medium">
                XP Reward
              </label>
              <Input
                id="edit-quiz-xp"
                type="number"
                min={0}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                disabled={isPending}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              style={{ backgroundColor: "#1CB0F6" }}
              className="text-white hover:opacity-90"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
