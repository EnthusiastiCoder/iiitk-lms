"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitAssignment, submitProject } from "@/actions/submissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code2,
  Loader2,
  Send,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeSubmissionProps {
  itemId: string;
  courseId: string;
  courseSlug: string;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  language: string;
  starterCode: string | null;
  requirements: string[] | null;
  dueDate: string | null;
  type: "assignment" | "project";
  existingSubmission?: {
    code: string;
    status: string;
    grade: number | null;
    feedback: string | null;
    submitted_at: string;
  } | null;
}

export function CodeSubmission({
  itemId,
  courseId,
  courseSlug,
  title,
  description,
  difficulty,
  xpReward,
  language,
  starterCode,
  requirements,
  dueDate,
  type,
  existingSubmission,
}: CodeSubmissionProps) {
  const [code, setCode] = useState(
    existingSubmission?.code ?? starterCode ?? ""
  );
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!code.trim()) return;
    startTransition(async () => {
      if (type === "assignment") {
        await submitAssignment(itemId, courseId, code);
      } else {
        await submitProject(itemId, courseId, code);
      }
      setSubmitted(true);
    });
  };

  const isAlreadySubmitted = !!existingSubmission;
  const isGraded = existingSubmission?.status === "graded";
  const isPendingReview = existingSubmission?.status === "pending";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href={`/student/courses/${courseSlug}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="capitalize">
            {type}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {difficulty}
          </Badge>
          <Badge variant="secondary">
            <Code2 className="h-3 w-3 mr-1" />
            {language}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-brand" />
            {xpReward} XP
          </span>
          {dueDate && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Due: {new Date(dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Requirements */}
      {requirements && requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {requirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-brand mt-0.5">-</span>
                  {req}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Existing Submission Status */}
      {isPendingReview && !submitted && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Submission pending review
                </p>
                <p className="text-sm text-muted-foreground">
                  Submitted on{" "}
                  {new Date(existingSubmission!.submitted_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isGraded && !submitted && (
        <Card className="border-brand/30 bg-brand/5">
          <CardContent className="py-4 space-y-2">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-brand" />
              <div>
                <p className="font-medium text-brand">Graded</p>
                <p className="text-sm text-muted-foreground">
                  Score: {existingSubmission!.grade}/100
                </p>
              </div>
            </div>
            {existingSubmission!.feedback && (
              <p className="text-sm text-muted-foreground pl-8">
                Feedback: {existingSubmission!.feedback}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success message */}
      {submitted && (
        <Card className="border-brand/30 bg-brand/5">
          <CardContent className="py-6 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-brand mx-auto" />
            <p className="font-semibold text-lg">Submitted successfully!</p>
            <p className="text-sm text-muted-foreground">
              Your {type} has been submitted for review.
            </p>
            <Link href={`/student/courses/${courseSlug}`}>
              <Button variant="outline" className="mt-3">
                <ArrowLeft className="h-4 w-4" />
                Back to Course
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Code Editor */}
      {!submitted && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isAlreadySubmitted ? "Update your code" : "Your Code"}
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Write your ${language} code here...`}
              rows={20}
              className="w-full rounded-xl bg-zinc-900 text-zinc-100 font-mono text-sm p-4 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-brand resize-y min-h-[300px] placeholder:text-zinc-500"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center justify-between">
            <Link href={`/student/courses/${courseSlug}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
            </Link>
            <Button
              className="bg-brand hover:bg-brand-dark text-white"
              onClick={handleSubmit}
              disabled={isPending || !code.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit {type === "assignment" ? "Assignment" : "Project"}
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
