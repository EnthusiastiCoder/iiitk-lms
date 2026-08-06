"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { professor } from "@/lib/api";

interface CreateQuizDialogProps {
  moduleId: string;
  courseId: string;
  moduleName: string;
}

type QuestionType = "multiple-choice" | "true-false" | "fill-blank";

export function CreateQuizDialog({
  moduleId,
  courseId,
  moduleName,
}: CreateQuizDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Phase tracking
  const [phase, setPhase] = useState<1 | 2>(1);
  const [quizId, setQuizId] = useState<string | null>(null);

  // Phase 1 - Quiz details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(10);
  const [xpReward, setXpReward] = useState(50);

  // Phase 2 - Question form
  const [questionsAdded, setQuestionsAdded] = useState(0);
  const [questionType, setQuestionType] = useState<QuestionType>("multiple-choice");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [questionXp, setQuestionXp] = useState(10);

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function resetQuestionForm() {
    setQuestionType("multiple-choice");
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setExplanation("");
    setQuestionXp(10);
    setError(null);
    setSuccessMessage(null);
  }

  function resetAll() {
    setPhase(1);
    setQuizId(null);
    setTitle("");
    setDescription("");
    setTimeLimit(10);
    setXpReward(50);
    setQuestionsAdded(0);
    resetQuestionForm();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetAll();
      router.refresh();
    }
  }

  function handleQuizSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await professor.createQuiz(moduleId, courseId, {
          title: title.trim(),
          description: description.trim(),
          timeLimit,
          xpReward,
        });
        setQuizId(result.id);
        setPhase(2);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create quiz"
        );
      }
    });
  }

  function getOptionsForType(): string[] {
    switch (questionType) {
      case "true-false":
        return ["True", "False"];
      case "fill-blank":
        return [];
      case "multiple-choice":
      default:
        return options;
    }
  }

  function handleAddQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!quizId) return;

    startTransition(async () => {
      try {
        await professor.createQuizQuestion(quizId, {
          type: questionType,
          question: question.trim(),
          options: getOptionsForType(),
          correctAnswer: correctAnswer.trim(),
          explanation: explanation.trim(),
          xpReward: questionXp,
        });
        setQuestionsAdded((prev) => prev + 1);
        resetQuestionForm();
        setSuccessMessage("Question added successfully!");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to add question"
        );
      }
    });
  }

  function handleDone() {
    setOpen(false);
    resetAll();
    router.refresh();
  }

  function handleOptionChange(index: number, value: string) {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button size="sm" variant="outline" />}
      >
        <ClipboardList className="size-3.5" />
        Add Quiz
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        {phase === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Quiz</DialogTitle>
              <DialogDescription>
                Add a new quiz to {moduleName}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleQuizSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="quiz-title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="quiz-title"
                  placeholder="Quiz title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="quiz-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="quiz-description"
                  placeholder="Brief description of this quiz"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="quiz-time-limit" className="text-sm font-medium">
                    Time Limit (minutes)
                  </label>
                  <Input
                    id="quiz-time-limit"
                    type="number"
                    min={1}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    disabled={isPending}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="quiz-xp" className="text-sm font-medium">
                    XP Reward
                  </label>
                  <Input
                    id="quiz-xp"
                    type="number"
                    min={0}
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    disabled={isPending}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Quiz"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add Questions</DialogTitle>
              <DialogDescription>
                Quiz created! Add questions below.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                style={{ backgroundColor: "#1CB0F6", color: "#fff" }}
              >
                {questionsAdded} {questionsAdded === 1 ? "question" : "questions"} added
              </Badge>
            </div>

            <form onSubmit={handleAddQuestion} className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Question Type</label>
                <Select
                  value={questionType}
                  onValueChange={(val) => {
                    if (!val) return;
                    setQuestionType(val as QuestionType);
                    setCorrectAnswer("");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="true-false">True / False</SelectItem>
                    <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="q-question" className="text-sm font-medium">
                  Question
                </label>
                <Input
                  id="q-question"
                  placeholder="Enter your question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              {questionType === "multiple-choice" && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Options</label>
                  <div className="grid gap-2">
                    {["A", "B", "C", "D"].map((label, index) => (
                      <Input
                        key={label}
                        placeholder={`Option ${label}`}
                        value={options[index]}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        disabled={isPending}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <label htmlFor="q-correct" className="text-sm font-medium">
                  Correct Answer
                </label>
                {questionType === "true-false" ? (
                  <Select
                    value={correctAnswer}
                    onValueChange={(v) => v && setCorrectAnswer(v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="True">True</SelectItem>
                      <SelectItem value="False">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="q-correct"
                    placeholder={
                      questionType === "multiple-choice"
                        ? "Type the correct option text"
                        : "Type the correct answer"
                    }
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    disabled={isPending}
                  />
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="q-explanation" className="text-sm font-medium">
                  Explanation
                </label>
                <Textarea
                  id="q-explanation"
                  placeholder="Explain why this is the correct answer"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={2}
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="q-xp" className="text-sm font-medium">
                  XP Reward
                </label>
                <Input
                  id="q-xp"
                  type="number"
                  min={0}
                  value={questionXp}
                  onChange={(e) => setQuestionXp(Number(e.target.value))}
                  disabled={isPending}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {successMessage && (
                <p className="text-sm" style={{ color: "#1CB0F6" }}>
                  {successMessage}
                </p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDone}
                  disabled={isPending}
                >
                  Done
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Question"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
