"use client";

import { useState, useEffect, useCallback } from "react";
import { quizzes } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "./QuizQuestion";
import { QuizQuestion } from "./QuizQuestion";
import { QuizTimer } from "./QuizTimer";
import { QuizResults } from "./QuizResults";

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
      const result = await quizzes.attempt(quizId, answers, score, timeSpent);
      setResults({ score, xpEarned: result.xpEarned });
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
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted]);

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Results View
  if (isSubmitted && results) {
    return (
      <QuizResults
        results={results}
        sortedQuestions={sortedQuestions}
        answers={answers}
        courseSlug={courseSlug}
      />
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
        <QuizTimer timeRemaining={timeRemaining} />
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
      <QuizQuestion
        question={currentQuestion}
        currentIndex={currentIndex}
        selectedAnswer={answers[currentQuestion.id]}
        onSelectAnswer={selectAnswer}
      />

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
