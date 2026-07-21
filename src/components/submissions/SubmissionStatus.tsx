"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";

export interface ExistingSubmission {
  id: string;
  code: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
  file_urls: string[] | null;
}

interface SubmissionStatusProps {
  existingSubmission: ExistingSubmission | null | undefined;
  submitted: boolean;
  type: "assignment" | "project";
  courseSlug: string;
}

export function SubmissionStatus({
  existingSubmission,
  submitted,
  type,
  courseSlug,
}: SubmissionStatusProps) {
  const isGraded = existingSubmission?.status === "graded";
  const isPendingReview = existingSubmission?.status === "pending";

  return (
    <>
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
    </>
  );
}
