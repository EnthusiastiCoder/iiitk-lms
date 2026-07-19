"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateAssignment } from "@/actions/content";

interface EditAssignmentDialogProps {
  assignmentId: string;
  currentTitle: string;
  currentDescription: string;
  currentDifficulty: string;
  currentXpReward: number;
  currentLanguage: string;
  currentStarterCode: string;
  currentRequirements: string[];
  currentDueDate: string | null;
}

export function EditAssignmentDialog({
  assignmentId,
  currentTitle,
  currentDescription,
  currentDifficulty,
  currentXpReward,
  currentLanguage,
  currentStarterCode,
  currentRequirements,
  currentDueDate,
}: EditAssignmentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [difficulty, setDifficulty] = useState(currentDifficulty || "medium");
  const [xpReward, setXpReward] = useState(currentXpReward || 75);
  const [language, setLanguage] = useState(currentLanguage || "python");
  const [starterCode, setStarterCode] = useState(currentStarterCode || "");
  const [requirements, setRequirements] = useState<string[]>(
    currentRequirements ?? []
  );
  const [newRequirement, setNewRequirement] = useState("");
  const [dueDate, setDueDate] = useState(currentDueDate ?? "");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setTitle(currentTitle);
    setDescription(currentDescription);
    setDifficulty(currentDifficulty || "medium");
    setXpReward(currentXpReward || 75);
    setLanguage(currentLanguage || "python");
    setStarterCode(currentStarterCode || "");
    setRequirements(currentRequirements ?? []);
    setNewRequirement("");
    setDueDate(currentDueDate ?? "");
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  }

  function addRequirement() {
    const trimmed = newRequirement.trim();
    if (trimmed && !requirements.includes(trimmed)) {
      setRequirements([...requirements, trimmed]);
      setNewRequirement("");
    }
  }

  function removeRequirement(index: number) {
    setRequirements(requirements.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await updateAssignment(assignmentId, {
          title: title.trim(),
          description: description.trim(),
          difficulty,
          xpReward,
          language: language.trim(),
          starterCode: starterCode.trim(),
          requirements,
          dueDate: dueDate || undefined,
        });
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update assignment"
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="icon-xs" />}>
        <Pencil className="h-3 w-3" />
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-lg"
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
          <DialogDescription>
            Update the assignment details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="edit-assignment-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="edit-assignment-title"
              placeholder="Assignment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="edit-assignment-description"
              className="text-sm font-medium"
            >
              Description
            </label>
            <Textarea
              id="edit-assignment-description"
              placeholder="Describe the assignment"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select
                value={difficulty}
                onValueChange={(v) => v && setDifficulty(v)}
              >
                <SelectTrigger className="w-full" disabled={isPending}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="edit-assignment-xp"
                className="text-sm font-medium"
              >
                XP Reward
              </label>
              <Input
                id="edit-assignment-xp"
                type="number"
                min={0}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="edit-assignment-language"
              className="text-sm font-medium"
            >
              Language
            </label>
            <Input
              id="edit-assignment-language"
              placeholder="e.g. python, javascript"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="edit-assignment-starter-code"
              className="text-sm font-medium"
            >
              Starter Code
            </label>
            <Textarea
              id="edit-assignment-starter-code"
              placeholder="# Write your starter code here..."
              rows={4}
              style={{ fontFamily: "monospace" }}
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Requirements</label>
            {requirements.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {requirements.map((req, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="rounded-sm p-0.5 hover:bg-muted-foreground/20"
                      disabled={isPending}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Add a requirement"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRequirement();
                  }
                }}
                disabled={isPending}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
                disabled={isPending || !newRequirement.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="edit-assignment-due-date"
              className="text-sm font-medium"
            >
              Due Date{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              id="edit-assignment-due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isPending}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

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
