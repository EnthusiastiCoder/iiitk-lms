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
  FolderGit2,
  Timer,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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

interface Quiz {
  id: string;
  module_id: string;
  title: string;
  description: string;
  time_limit: number;
  question_count: number;
  xp_reward: number;
}

interface Assignment {
  id: string;
  module_id: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
  language: string;
  due_date: string | null;
}

interface Project {
  id: string;
  module_id: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
  language: string;
  is_final_project: boolean;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  quizzes?: Quiz[];
  assignments?: Assignment[];
  projects?: Project[];
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
          const quizzes = mod.quizzes ?? [];
          const assignments = mod.assignments ?? [];
          const projects = mod.projects ?? [];

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
                      {quizzes.length > 0 && ` · ${quizzes.length} quiz${quizzes.length > 1 ? "zes" : ""}`}
                      {assignments.length > 0 && ` · ${assignments.length} assignment${assignments.length > 1 ? "s" : ""}`}
                      {projects.length > 0 && ` · ${projects.length} project${projects.length > 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-3">
                <div className="space-y-1">
                  {/* Lessons */}
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

                  {/* Quizzes */}
                  {quizzes.length > 0 && (
                    <>
                      <div className="border-t my-2" />
                      {quizzes.map((quiz) => (
                        <motion.div
                          key={quiz.id}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Link
                            href={`/student/courses/${courseSlug}/quiz/${quiz.id}`}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent group"
                          >
                            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                            <span className="flex-1 truncate">{quiz.title}</span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                              <Timer className="h-3 w-3" />
                              {quiz.time_limit}m
                            </span>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {quiz.question_count} Q
                            </Badge>
                            <span className="text-xs text-brand/70 font-medium shrink-0">
                              +{quiz.xp_reward} XP
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </>
                  )}

                  {/* Assignments */}
                  {assignments.length > 0 && (
                    <>
                      <div className="border-t my-2" />
                      {assignments.map((assignment) => (
                        <motion.div
                          key={assignment.id}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Link
                            href={`/student/courses/${courseSlug}/assignment/${assignment.id}`}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent group"
                          >
                            <Code2 className="h-4 w-4 text-blue-500 shrink-0" />
                            <span className="flex-1 truncate">{assignment.title}</span>
                            <Badge variant="secondary" className="text-xs capitalize shrink-0">
                              {assignment.difficulty}
                            </Badge>
                            <span className="text-xs text-brand/70 font-medium shrink-0">
                              +{assignment.xp_reward} XP
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </>
                  )}

                  {/* Projects */}
                  {projects.length > 0 && (
                    <>
                      <div className="border-t my-2" />
                      {projects.map((project) => (
                        <motion.div
                          key={project.id}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Link
                            href={`/student/courses/${courseSlug}/project/${project.id}`}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent group"
                          >
                            <FolderGit2 className="h-4 w-4 text-purple-500 shrink-0" />
                            <span className="flex-1 truncate">{project.title}</span>
                            {project.is_final_project && (
                              <Badge className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0">
                                Final
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs capitalize shrink-0">
                              {project.difficulty}
                            </Badge>
                            <span className="text-xs text-brand/70 font-medium shrink-0">
                              +{project.xp_reward} XP
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
    </Accordion>
  );
}
