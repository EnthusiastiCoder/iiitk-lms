"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  ArrowLeft,
  Loader2,
  Info,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { completeLesson } from "@/actions/lessons";

interface ContentSection {
  type: "text" | "code" | "callout";
  content?: string;
  code?: string;
  language?: string;
  variant?: string;
}

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

interface ModuleLesson {
  id: string;
  title: string;
  order: number;
  type: string;
  estimated_minutes: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: ModuleLesson[];
}

interface Course {
  id: string;
  title: string;
  accent_color: string;
  modules: Module[];
}

interface LessonViewerProps {
  lesson: Lesson;
  course: Course;
  courseSlug: string;
  completedLessonIds: string[];
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
}

const calloutStyles: Record<
  string,
  { icon: typeof Info; bg: string; border: string; text: string }
> = {
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  tip: {
    icon: Lightbulb,
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-700 dark:text-green-400",
  },
};

export function LessonViewer({
  lesson,
  course,
  courseSlug,
  completedLessonIds,
  prevLesson,
  nextLesson,
}: LessonViewerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(
    completedLessonIds.includes(lesson.id)
  );
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const completedSet = new Set(completedLessonIds);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeLesson(lesson.id, lesson.course_id);
      setCompleted(true);
      if (!result.already) {
        setXpEarned(result.xpEarned);
        setTimeout(() => setXpEarned(null), 3000);
      }
      if (nextLesson) {
        router.push(
          `/student/courses/${courseSlug}/lessons/${nextLesson.id}`
        );
      }
    });
  };

  const sections = lesson.content?.sections ?? [];

  return (
    <>
      {/* Module Sidebar */}
      <aside
        className={cn(
          "w-72 border-r bg-card shrink-0 flex flex-col h-full transition-all duration-300 overflow-hidden",
          !sidebarOpen && "w-0 border-r-0"
        )}
      >
        <div className="p-4 border-b shrink-0">
          <Link
            href={`/student/courses/${courseSlug}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to course
          </Link>
          <h3 className="font-semibold text-sm mt-3 truncate">
            {course.title}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {course.modules
            .sort((a, b) => a.order - b.order)
            .map((mod) => (
              <div key={mod.id} className="mb-2">
                <p className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {mod.title}
                </p>
                {mod.lessons
                  .sort((a, b) => a.order - b.order)
                  .map((l) => {
                    const isActive = l.id === lesson.id;
                    const isComplete =
                      completedSet.has(l.id) ||
                      (l.id === lesson.id && completed);
                    return (
                      <Link
                        key={l.id}
                        href={`/student/courses/${courseSlug}/lessons/${l.id}`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">{l.title}</span>
                      </Link>
                    );
                  })}
              </div>
            ))}
        </div>
      </aside>

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

            {sections.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p>No content available for this lesson yet.</p>
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
    </>
  );
}

function SectionRenderer({ section }: { section: ContentSection }) {
  if (section.type === "text") {
    return (
      <div className="leading-relaxed text-foreground/90 whitespace-pre-wrap">
        {section.content}
      </div>
    );
  }

  if (section.type === "code") {
    return (
      <div className="rounded-lg overflow-hidden ring-1 ring-foreground/10">
        {section.language && (
          <div className="bg-muted px-4 py-1.5 text-xs text-muted-foreground font-mono border-b">
            {section.language}
          </div>
        )}
        <pre className="bg-muted/50 p-4 overflow-x-auto">
          <code className="text-sm font-mono leading-relaxed text-foreground/90">
            {section.code ?? section.content}
          </code>
        </pre>
      </div>
    );
  }

  if (section.type === "callout") {
    const style =
      calloutStyles[section.variant ?? "info"] ?? calloutStyles.info;
    const Icon = style.icon;

    return (
      <div
        className={cn(
          "rounded-lg border p-4 flex gap-3",
          style.bg,
          style.border
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", style.text)} />
        <p className={cn("text-sm leading-relaxed", style.text)}>
          {section.content}
        </p>
      </div>
    );
  }

  return null;
}
