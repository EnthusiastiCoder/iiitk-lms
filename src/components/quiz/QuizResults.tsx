"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "./QuizQuestion";

interface QuizResultsProps {
  results: { score: number; xpEarned: number };
  sortedQuestions: Question[];
  answers: Record<string, string>;
  courseSlug: string;
}

export function QuizResults({
  results,
  sortedQuestions,
  answers,
  courseSlug,
}: QuizResultsProps) {
  const totalQuestions = sortedQuestions.length;
  const scoreColor =
    results.score >= 80
      ? "text-brand"
      : results.score >= 50
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Score Card */}
      <Card>
        <CardContent className="text-center py-8 space-y-4">
          <Trophy className="h-12 w-12 mx-auto text-amber-500" />
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={scoreColor}
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={
                  2 * Math.PI * 52 * (1 - results.score / 100)
                }
              />
            </svg>
            <span className={cn("absolute text-3xl font-bold", scoreColor)}>
              {results.score}%
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-brand" />
            <span className="font-semibold">+{results.xpEarned} XP earned</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {sortedQuestions.filter(
              (q) =>
                (answers[q.id] ?? "").trim().toLowerCase() ===
                q.correct_answer.trim().toLowerCase()
            ).length}{" "}
            of {totalQuestions} questions correct
          </p>
        </CardContent>
      </Card>

      {/* Question Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Question Breakdown</h3>
        {sortedQuestions.map((q, i) => {
          const userAnswer = answers[q.id] ?? "";
          const isCorrect =
            userAnswer.trim().toLowerCase() ===
            q.correct_answer.trim().toLowerCase();

          return (
            <Card key={q.id}>
              <CardContent className="py-4 space-y-2">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {i + 1}. {q.question}
                    </p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Your answer: </span>
                        <span
                          className={
                            isCorrect
                              ? "text-brand font-medium"
                              : "text-red-500 font-medium"
                          }
                        >
                          {userAnswer || "(no answer)"}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p>
                          <span className="text-muted-foreground">
                            Correct answer:{" "}
                          </span>
                          <span className="text-brand font-medium">
                            {q.correct_answer}
                          </span>
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-muted-foreground mt-1 italic">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Link href={`/student/courses/${courseSlug}`}>
          <Button variant="outline" size="lg">
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Button>
        </Link>
      </div>
    </div>
  );
}
