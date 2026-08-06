"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModuleLesson {
  id: string;
  title: string;
  order: number;
  type: string;
  estimated_minutes: number;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: ModuleLesson[];
}

export interface Course {
  id: string;
  title: string;
  accent_color: string;
  modules: Module[];
}

interface LessonSidebarProps {
  course: Course;
  courseSlug: string;
  currentLessonId: string;
  completedLessonIds: string[];
  completed: boolean;
  sidebarOpen: boolean;
}

export function LessonSidebar({
  course,
  courseSlug,
  currentLessonId,
  completedLessonIds,
  completed,
  sidebarOpen,
}: LessonSidebarProps) {
  const completedSet = new Set(completedLessonIds);

  return (
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
                  const isActive = l.id === currentLessonId;
                  const isComplete =
                    completedSet.has(l.id) ||
                    (l.id === currentLessonId && completed);
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
  );
}
