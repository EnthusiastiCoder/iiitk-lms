"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Code2,
  Lightbulb,
  Clock,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order: number;
  type: string;
  estimated_minutes: number;
  xp_reward: number;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface CourseModulesProps {
  modules: Module[];
  courseSlug: string;
  completedLessonIds: string[];
}

const lessonTypeIcons: Record<string, typeof FileText> = {
  video: Play,
  text: FileText,
  code: Code2,
  quiz: Lightbulb,
};

export function CourseModules({
  modules,
  courseSlug,
  completedLessonIds,
}: CourseModulesProps) {
  const completedSet = new Set(completedLessonIds);

  return (
    <Accordion>
      {modules
        .sort((a, b) => a.order - b.order)
        .map((mod, idx) => {
          const moduleLessonCount = mod.lessons.length;
          const moduleCompletedCount = mod.lessons.filter((l) =>
            completedSet.has(l.id)
          ).length;
          const isModuleComplete =
            moduleLessonCount > 0 &&
            moduleCompletedCount === moduleLessonCount;

          return (
            <AccordionItem
              key={mod.id}
              className="border rounded-xl mb-3 px-2"
            >
              <AccordionTrigger className="hover:no-underline py-4 px-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      "flex items-center justify-center h-7 w-7 rounded-lg text-xs font-bold shrink-0",
                      isModuleComplete
                        ? "bg-brand/20 text-brand"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold truncate">{mod.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {moduleCompletedCount}/{moduleLessonCount} lessons
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-3">
                <div className="space-y-1">
                  {mod.lessons
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => {
                      const isCompleted = completedSet.has(lesson.id);
                      const Icon =
                        lessonTypeIcons[lesson.type] ?? FileText;

                      return (
                        <motion.div
                          key={lesson.id}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Link
                            href={`/student/courses/${courseSlug}/lessons/${lesson.id}`}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                              "hover:bg-accent group",
                              isCompleted && "opacity-75"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="flex-1 truncate">
                              {lesson.title}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                              <Clock className="h-3 w-3" />
                              {lesson.estimated_minutes}m
                            </span>
                            <span className="text-xs text-brand/70 font-medium shrink-0">
                              +{lesson.xp_reward} XP
                            </span>
                          </Link>
                        </motion.div>
                      );
                    })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
    </Accordion>
  );
}
