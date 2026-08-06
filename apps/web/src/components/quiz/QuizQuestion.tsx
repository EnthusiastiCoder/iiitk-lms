"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface Question {
  id: string;
  type: "multiple-choice" | "true-false" | "fill-blank";
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  xp_reward: number;
  order: number;
}

interface QuizQuestionProps {
  question: Question;
  currentIndex: number;
  selectedAnswer: string | undefined;
  onSelectAnswer: (questionId: string, answer: string) => void;
}

export function QuizQuestion({
  question,
  currentIndex,
  selectedAnswer,
  onSelectAnswer,
}: QuizQuestionProps) {
  return (
    <Card>
      <CardContent className="py-6 space-y-6">
        <div className="flex items-start gap-3">
          <Badge className="shrink-0 mt-0.5">{currentIndex + 1}</Badge>
          <p className="text-lg font-medium leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Multiple Choice */}
        {question.type === "multiple-choice" &&
          question.options && (
            <div className="grid gap-3">
              {question.options.map((option, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = selectedAnswer === option;
                return (
                  <button
                    key={i}
                    onClick={() => onSelectAnswer(question.id, option)}
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
        {question.type === "true-false" && (
          <div className="grid grid-cols-2 gap-4">
            {["True", "False"].map((option) => {
              const isSelected = selectedAnswer === option;
              return (
                <button
                  key={option}
                  onClick={() => onSelectAnswer(question.id, option)}
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
        {question.type === "fill-blank" && (
          <Input
            placeholder="Type your answer..."
            value={selectedAnswer ?? ""}
            onChange={(e) =>
              onSelectAnswer(question.id, e.target.value)
            }
            className="text-base"
          />
        )}
      </CardContent>
    </Card>
  );
}
