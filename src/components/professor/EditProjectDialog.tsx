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
import { updateProject } from "@/actions/content";

interface EditProjectDialogProps {
  projectId: string;
  currentTitle: string;
  currentDescription: string;
  currentDifficulty: string;
  currentXpReward: number;
  currentLanguage: string;
  currentStarterCode: string;
  currentRequirements: string[];
}

export function EditProjectDialog({
  projectId,
  currentTitle,
  currentDescription,
  currentDifficulty,
  currentXpReward,
  currentLanguage,
  currentStarterCode,
  currentRequirements,
}: EditProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [difficulty, setDifficulty] = useState(currentDifficulty || "medium");
  const [xpReward, setXpReward] = useState(currentXpReward || 100);
  const [language, setLanguage] = useState(currentLanguage || "python");
  const [starterCode, setStarterCode] = useState(currentStarterCode || "");
  const [requirements, setRequirements] = useState<string[]>(
    currentRequirements ?? []
  );
  const [newRequirement, setNewRequirement] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setTitle(currentTitle);
    setDescription(currentDescription);
    setDifficulty(currentDifficulty || "medium");
    setXpReward(currentXpReward || 100);
    setLanguage(currentLanguage || "python");
    setStarterCode(currentStarterCode || "");
    setRequirements(currentRequirements ?? []);
    setNewRequirement("");
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
      setRequirements((prev) => [...prev, trimmed]);
      setNewRequirement("");
    }
  }

  function removeRequirement(index: number) {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await updateProject(projectId, {
          title: title.trim(),
          description: description.trim(),
          difficulty,
          xpReward,
          language: language.trim(),
          starterCode: starterCode.trim(),
          requirements,
        });
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update project"
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
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="edit-project-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="edit-project-title"
              placeholder="Project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="edit-project-description"
              className="text-sm font-medium"
            >
              Description
            </label>
            <Textarea
              id="edit-project-description"
              placeholder="Brief description of this project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
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
                <SelectTrigger className="w-full">
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
                htmlFor="edit-project-xp"
                className="text-sm font-medium"
              >
                XP Reward
              </label>
              <Input
                id="edit-project-xp"
                type="number"
                min={0}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="edit-project-language" className="text-sm font-medium">
              Language
            </label>
            <Input
              id="edit-project-language"
              placeholder="e.g. python, javascript"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="edit-project-starter-code"
              className="text-sm font-medium"
            >
              Starter Code
            </label>
            <Textarea
              id="edit-project-starter-code"
              placeholder="Optional starter code for students"
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              rows={4}
              className="font-mono text-sm"
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Requirements</label>
            <div className="flex flex-wrap gap-2">
              {requirements.map((req, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                >
                  {req}
                  <button
                    type="button"
                    onClick={() => removeRequirement(i)}
                    className="text-muted-foreground hover:text-foreground"
                    disabled={isPending}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
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
