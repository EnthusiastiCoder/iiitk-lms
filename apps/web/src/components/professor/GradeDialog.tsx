"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { gradeSubmission } from "@/actions/submissions";

interface GradeDialogProps {
  submissionId: string;
  studentName: string;
  submissionType: "assignment_submissions" | "project_submissions";
}

export function GradeDialog({
  submissionId,
  studentName,
  submissionType,
}: GradeDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  const typeLabel =
    submissionType === "assignment_submissions" ? "Assignment" : "Project";

  const handleSubmit = () => {
    const numericGrade = Number(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) return;

    startTransition(async () => {
      await gradeSubmission(submissionId, submissionType, numericGrade, feedback);
      setOpen(false);
      setGrade("");
      setFeedback("");
      router.refresh();
    });
  };

  const isValid =
    grade !== "" &&
    !isNaN(Number(grade)) &&
    Number(grade) >= 0 &&
    Number(grade) <= 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" variant="outline" className="text-xs">
          <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
          Grade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grade {typeLabel}</DialogTitle>
          <DialogDescription>
            Grading submission from {studentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Grade (0-100)
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="Enter grade..."
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Feedback
            </label>
            <Textarea
              placeholder="Write feedback for the student..."
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isPending}>
            {isPending ? "Submitting..." : "Submit Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
