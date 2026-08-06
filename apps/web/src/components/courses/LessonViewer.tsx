"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { lessons } from "@/lib/api";
import { FlashcardDeck } from "@/components/flashcard/FlashcardDeck";
import { XpCelebration } from "@/components/xp/XpCelebration";
import { SectionRenderer } from "./SectionRenderer";
import { LessonSidebar } from "./LessonSidebar";
import type { ContentSection } from "./SectionRenderer";
import type { Course } from "./LessonSidebar";

interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  type: string;
  estimated_minutes: number;
  xp_reward: number;
  content: { sections: ContentSection[] } | null;
}

interface FlashcardDeckData {
  id: string;
  title: string;
  cards: { front: string; back: string }[];
}

interface LessonViewerProps {
  lesson: Lesson;
  course: Course;
  courseSlug: string;
  completedLessonIds: string[];
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  flashcardDeck?: FlashcardDeckData | null;
}

export function LessonViewer({
  lesson,
  course,
  courseSlug,
  completedLessonIds,
  prevLesson,
  nextLesson,
  flashcardDeck,
}: LessonViewerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(
    completedLessonIds.includes(lesson.id)
  );
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<{
    xp: number;
    leveledUp: boolean;
    newLevel?: number;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleComplete = () => {
    startTransition(async () => {
      const result = await lessons.complete(lesson.id, lesson.course_id);
      setCompleted(true);
      if (!result.alreadyCompleted) {
        setXpEarned(result.xpEarned);
        setCelebration({
          xp: result.xpEarned,
          leveledUp: (result as Record<string, unknown>).leveledUp as boolean ?? false,
          newLevel: (result as Record<string, unknown>).newLevel as number | undefined,
        });
        setTimeout(() => setXpEarned(null), 3000);
      }
      if (nextLesson) {
        setTimeout(() => {
          router.push(
            `/student/courses/${courseSlug}/lessons/${nextLesson.id}`
          );
        }, 2600);
      }
    });
  };

  const sections = lesson.content?.sections ?? [];

  return (
    <>
      <LessonSidebar
        course={course}
        courseSlug={courseSlug}
        currentLessonId={lesson.id}
        completedLessonIds={completedLessonIds}
        completed={completed}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Lesson Header */}
        <div className="border-b px-4 sm:px-6 py-4 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">
              {lesson.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lesson.estimated_minutes} min
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {lesson.xp_reward} XP
              </span>
              {completed && (
                <Badge
                  variant="secondary"
                  className="bg-brand/15 text-brand text-[11px]"
                >
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {/* XP Toast */}
          {xpEarned !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-1.5 bg-brand/15 text-brand px-3 py-1.5 rounded-lg text-sm font-bold"
            >
              <Zap className="h-4 w-4" />
              +{xpEarned} XP
            </motion.div>
          )}
        </div>

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {lesson.description && (
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {lesson.description}
              </p>
            )}

            <div className="space-y-6">
              {sections.map((section, i) => (
                <SectionRenderer key={i} section={section} />
              ))}
            </div>

            {sections.length === 0 && !flashcardDeck && (
              <div className="text-center py-16 text-muted-foreground">
                <p>No content available for this lesson yet.</p>
              </div>
            )}

            {flashcardDeck && flashcardDeck.cards.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <FlashcardDeck
                  title={flashcardDeck.title}
                  cards={flashcardDeck.cards}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
          {prevLesson ? (
            <Link
              href={`/student/courses/${courseSlug}/lessons/${prevLesson.id}`}
            >
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {prevLesson.title}
                </span>
                <span className="sm:hidden">Previous</span>
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {!completed ? (
            <Button
              onClick={handleComplete}
              disabled={isPending}
              size="lg"
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {nextLesson ? "Complete & Next" : "Complete Lesson"}
            </Button>
          ) : nextLesson ? (
            <Link
              href={`/student/courses/${courseSlug}/lessons/${nextLesson.id}`}
            >
              <Button size="lg" className="gap-2">
                Next Lesson
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href={`/student/courses/${courseSlug}`}>
              <Button variant="outline" size="lg">
                Back to Course
              </Button>
            </Link>
          )}

          <div className="w-0 sm:w-auto" />
        </div>
      </div>

      {celebration && (
        <XpCelebration
          xp={celebration.xp}
          leveledUp={celebration.leveledUp}
          newLevel={celebration.newLevel}
          onDismiss={() => setCelebration(null)}
        />
      )}
    </>
  );
}
