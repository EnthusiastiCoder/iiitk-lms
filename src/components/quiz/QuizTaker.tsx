"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitQuizAttempt } from "@/actions/submissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Trophy,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  type: "multiple-choice" | "true-false" | "fill-blank";
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  xp_reward: number;
  order: number;
}

interface QuizTakerProps {
  quizId: string;
  courseSlug: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
}

export function QuizTaker({
  quizId,
  courseSlug,
  title,
  description,
  timeLimit,
  questions,
}: QuizTakerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    xpEarned: number;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const currentQuestion = sortedQuestions[currentIndex];
  const totalQuestions = sortedQuestions.length;
  const answeredCount = Object.keys(answers).length;

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);

    let correctCount = 0;
    sortedQuestions.forEach((q) => {
      const userAnswer = (answers[q.id] ?? "").trim().toLowerCase();
      const correctAnswer = q.correct_answer.trim().toLowerCase();
      if (userAnswer === correctAnswer) correctCount++;
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const timeSpent = timeLimit * 60 - timeRemaining;

    try {
      const result = await submitQuizAttempt(quizId, answers, score, timeSpent);
      setResults({ score: result.score, xpEarned: result.xpEarned });
      setIsSubmitted(true);
    } catch {
      // Allow retry on error
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, isSubmitting, isSubmitted, quizId, sortedQuestions, timeLimit, timeRemaining, totalQuestions]);

  // Timer
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeRemaining, isSubmitted, handleSubmit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Results View
  if (isSubmitted && results) {
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

  // Quiz Taking View
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-lg font-mono font-bold px-4 py-2 rounded-lg bg-card ring-1 ring-foreground/10",
            timeRemaining < 120 && "text-red-500"
          )}
        >
          <Clock className="h-5 w-5" />
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand transition-all rounded-full"
            style={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardContent className="py-6 space-y-6">
          <div className="flex items-start gap-3">
            <Badge className="shrink-0 mt-0.5">{currentIndex + 1}</Badge>
            <p className="text-lg font-medium leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Multiple Choice */}
          {currentQuestion.type === "multiple-choice" &&
            currentQuestion.options && (
              <div className="grid gap-3">
                {currentQuestion.options.map((option, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = answers[currentQuestion.id] === option;
                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(currentQuestion.id, option)}
                      className={cn(
                        "flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left text-sm transition-all",
                        isSelected
                          ? "ring-2 ring-brand border-brand bg-brand/5"
                          : "border-border hover:border-foreground/20 hover:bg-accent"
                      )}
                    >
                      <span
                        className={cn(
                          "flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold shrink-0",
                          isSelected
                            ? "bg-brand text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {letter}
                      </span>
                      <span className="flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

          {/* True/False */}
          {currentQuestion.type === "true-false" && (
            <div className="grid grid-cols-2 gap-4">
              {["True", "False"].map((option) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={option}
                    onClick={() => selectAnswer(currentQuestion.id, option)}
                    className={cn(
                      "rounded-xl border px-6 py-4 text-center text-base font-semibold transition-all",
                      isSelected
                        ? "ring-2 ring-brand border-brand bg-brand/5"
                        : "border-border hover:border-foreground/20 hover:bg-accent"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill in the Blank */}
          {currentQuestion.type === "fill-blank" && (
            <Input
              placeholder="Type your answer..."
              value={answers[currentQuestion.id] ?? ""}
              onChange={(e) =>
                selectAnswer(currentQuestion.id, e.target.value)
              }
              className="text-base"
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentIndex < totalQuestions - 1 ? (
          <Button
            onClick={() => setCurrentIndex((prev) => prev + 1)}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="bg-brand hover:bg-brand-dark text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </Button>
        )}
      </div>

      {/* Question Navigator Dots */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {sortedQuestions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-8 w-8 rounded-lg text-xs font-medium transition-all",
              i === currentIndex
                ? "bg-brand text-white"
                : answers[q.id]
                  ? "bg-brand/20 text-brand"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
