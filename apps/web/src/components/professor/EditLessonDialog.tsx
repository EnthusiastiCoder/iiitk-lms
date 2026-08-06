"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, X } from "lucide-react";

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
import { updateLesson } from "@/actions/content";

interface ContentSection {
  type: "text" | "code";
  content: string;
}

interface EditLessonDialogProps {
  lessonId: string;
  currentTitle: string;
  currentDescription: string;
  currentType: string;
  currentEstimatedMinutes: number;
  currentXpReward: number;
  currentContent: { sections?: ContentSection[] } | null;
}

export function EditLessonDialog({
  lessonId,
  currentTitle,
  currentDescription,
  currentType,
  currentEstimatedMinutes,
  currentXpReward,
  currentContent,
}: EditLessonDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [type, setType] = useState(currentType || "reading");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    currentEstimatedMinutes || 15
  );
  const [xpReward, setXpReward] = useState(currentXpReward || 50);
  const [sections, setSections] = useState<ContentSection[]>(
    currentContent?.sections ?? []
  );

  function resetForm() {
    setTitle(currentTitle);
    setDescription(currentDescription);
    setType(currentType || "reading");
    setEstimatedMinutes(currentEstimatedMinutes || 15);
    setXpReward(currentXpReward || 50);
    setSections(currentContent?.sections ?? []);
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  }

  function addSection(sectionType: "text" | "code") {
    setSections((prev) => [...prev, { type: sectionType, content: "" }]);
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSectionContent(index: number, content: string) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, content } : s))
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);

    startTransition(async () => {
      try {
        await updateLesson(lessonId, {
          title: title.trim(),
          description: description.trim(),
          type,
          estimatedMinutes,
          xpReward,
          content: { sections },
        });
        setOpen(false);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to update lesson");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="icon-xs" />}>
        <Pencil className="h-3 w-3" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>
              Update the lesson details.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Title
              </label>
              <Input
                placeholder="e.g. Introduction to Variables"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Description
              </label>
              <Textarea
                placeholder="Brief description of this lesson..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="min-h-0"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Type
                </label>
                <Select
                  value={type}
                  onValueChange={(v) => v && setType(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Minutes
                </label>
                <Input
                  type="number"
                  min={1}
                  value={estimatedMinutes}
                  onChange={(e) =>
                    setEstimatedMinutes(Number(e.target.value) || 1)
                  }
                />
              </div>
              <div className="w-20">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  XP
                </label>
                <Input
                  type="number"
                  min={0}
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Content Sections
              </label>
              <div className="flex flex-col gap-2">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border p-2"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase tracking-wide"
                      >
                        {section.type}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeSection(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder={
                        section.type === "code"
                          ? "// Write code here..."
                          : "Write content here..."
                      }
                      value={section.content}
                      onChange={(e) =>
                        updateSectionContent(index, e.target.value)
                      }
                      rows={3}
                      className={
                        section.type === "code"
                          ? "min-h-0 font-mono text-xs"
                          : "min-h-0"
                      }
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => addSection("text")}
                  >
                    <Plus className="h-3 w-3" />
                    Add Text
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => addSection("code")}
                  >
                    <Plus className="h-3 w-3" />
                    Add Code
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              style={{ backgroundColor: "#1CB0F6", color: "white" }}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
