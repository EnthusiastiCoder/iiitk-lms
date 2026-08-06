"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { professor } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface ContentSection {
  type: "text" | "code";
  content: string;
}

interface CreateLessonDialogProps {
  moduleId: string;
  courseId: string;
  moduleName: string;
}

export function CreateLessonDialog({
  moduleId,
  courseId,
  moduleName,
}: CreateLessonDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("reading");
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [xpReward, setXpReward] = useState(50);
  const [sections, setSections] = useState<ContentSection[]>([]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("reading");
    setEstimatedMinutes(15);
    setXpReward(50);
    setSections([]);
    setError(null);
  };

  const addSection = (sectionType: "text" | "code") => {
    setSections((prev) => [...prev, { type: sectionType, content: "" }]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSectionContent = (index: number, content: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, content } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);

    startTransition(async () => {
      try {
        await professor.createLesson(moduleId, courseId, {
          title: title.trim(),
          description: description.trim(),
          type,
          estimatedMinutes,
          xpReward,
          content: { sections },
        });
        setOpen(false);
        resetForm();
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create lesson");
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setError(null);
      }}
    >
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Plus className="h-3.5 w-3.5" />
        Add Lesson
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
            <DialogDescription>
              Create a new lesson in{" "}
              <span className="font-medium text-foreground">{moduleName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-4">
            {/* Title */}
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

            {/* Description */}
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

            {/* Type, Estimated Minutes, XP Reward */}
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

            {/* Content Sections */}
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

            {/* Error message */}
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
              {isPending ? "Creating..." : "Add Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
