import { getCourseContentForProfessor } from "@/actions/content";
import { getClassStats } from "@/actions/professor";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Users,
  Clock,
  Zap,
  ClipboardList,
  FileCode,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";

import { CreateModuleDialog } from "@/components/professor/CreateModuleDialog";
import { CreateLessonDialog } from "@/components/professor/CreateLessonDialog";
import { CreateQuizDialog } from "@/components/professor/CreateQuizDialog";
import { CreateAssignmentDialog } from "@/components/professor/CreateAssignmentDialog";
import { CreateProjectDialog } from "@/components/professor/CreateProjectDialog";
import { DeleteConfirmDialog } from "@/components/professor/DeleteConfirmDialog";

import {
  deleteModule,
  deleteLesson,
  deleteQuiz,
  deleteAssignment,
  deleteProject,
} from "@/actions/content";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  let course: any = null;
  try {
    course = await getCourseContentForProfessor(courseSlug);
  } catch {
    // Error
  }

  let stats: any = null;
  try {
    const allStats = await getClassStats();
    stats = allStats.find((s: any) => s.courseSlug === courseSlug) ?? null;
  } catch {
    // No stats
  }

  if (!course) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <Link
          href="/professor/courses"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Course not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const modules = course.modules ?? [];
  const totalLessons = modules.reduce(
    (sum: number, m: any) => sum + (m.lessons?.length ?? 0),
    0
  );
  const totalQuizzes = modules.reduce(
    (sum: number, m: any) => sum + (m.quizzes?.length ?? 0),
    0
  );
  const totalAssignments = modules.reduce(
    (sum: number, m: any) => sum + (m.assignments?.length ?? 0),
    0
  );
  const totalProjects = modules.reduce(
    (sum: number, m: any) => sum + (m.projects?.length ?? 0),
    0
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      {/* Back link */}
      <Link
        href="/professor/courses"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>

      {/* Course Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              {course.description && (
                <CardDescription className="mt-1">
                  {course.description}
                </CardDescription>
              )}
            </div>
            <Badge
              style={{
                backgroundColor: course.accent_color
                  ? `${course.accent_color}20`
                  : "rgba(28, 176, 246, 0.1)",
                color: course.accent_color || "#1CB0F6",
              }}
            >
              {course.slug}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{totalLessons}</strong> lessons across{" "}
                <strong>{modules.length}</strong> modules
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{totalQuizzes}</strong> quizzes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{totalAssignments}</strong> assignments
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{totalProjects}</strong> projects
              </span>
            </div>
            {stats && (
              <>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{stats.enrolled}</strong> students enrolled
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    Avg progress: <strong>{stats.avgProgress}%</strong>
                  </span>
                </div>
              </>
            )}
          </div>
          {stats && (
            <div className="mt-4">
              <Progress value={stats.avgProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Modules & Content</h2>
        <CreateModuleDialog courseId={course.id} />
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No modules have been added to this course yet. Click "Add Module"
            above to get started.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-2">
            <Accordion>
              {modules.map((mod: any) => {
                const lessonCount = mod.lessons?.length ?? 0;
                const quizCount = mod.quizzes?.length ?? 0;
                const assignmentCount = mod.assignments?.length ?? 0;
                const projectCount = mod.projects?.length ?? 0;
                const totalItems =
                  lessonCount + quizCount + assignmentCount + projectCount;

                return (
                  <AccordionItem key={mod.id} value={mod.id}>
                    <AccordionTrigger className="px-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="rounded-lg p-1.5 shrink-0"
                          style={{
                            backgroundColor: course.accent_color
                              ? `${course.accent_color}15`
                              : "rgba(28, 176, 246, 0.1)",
                          }}
                        >
                          <BookOpen
                            className="h-4 w-4"
                            style={{
                              color: course.accent_color || "#1CB0F6",
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium truncate">{mod.title}</p>
                          {mod.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {mod.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="shrink-0 mr-2">
                          {totalItems} items
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap mb-4 pb-3 border-b">
                        <CreateLessonDialog
                          moduleId={mod.id}
                          courseId={course.id}
                          moduleName={mod.title}
                        />
                        <CreateQuizDialog
                          moduleId={mod.id}
                          courseId={course.id}
                          moduleName={mod.title}
                        />
                        <CreateAssignmentDialog
                          moduleId={mod.id}
                          courseId={course.id}
                          moduleName={mod.title}
                        />
                        <CreateProjectDialog
                          moduleId={mod.id}
                          courseId={course.id}
                          moduleName={mod.title}
                        />
                        <div className="ml-auto">
                          <DeleteConfirmDialog
                            title="Delete Module"
                            description={`Are you sure you want to delete "${mod.title}"? All lessons, quizzes, assignments, and projects in this module will also be deleted. This action cannot be undone.`}
                            onConfirm={deleteModule.bind(null, mod.id)}
                          />
                        </div>
                      </div>

                      {totalItems === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          No content in this module yet. Use the buttons above
                          to add lessons, quizzes, assignments, or projects.
                        </p>
                      ) : (
                        <Tabs defaultValue="lessons">
                          <TabsList variant="line" className="mb-3">
                            <TabsTrigger value="lessons">
                              <FileText className="h-3.5 w-3.5" />
                              Lessons ({lessonCount})
                            </TabsTrigger>
                            <TabsTrigger value="quizzes">
                              <ClipboardList className="h-3.5 w-3.5" />
                              Quizzes ({quizCount})
                            </TabsTrigger>
                            <TabsTrigger value="assignments">
                              <FileCode className="h-3.5 w-3.5" />
                              Assignments ({assignmentCount})
                            </TabsTrigger>
                            <TabsTrigger value="projects">
                              <FolderKanban className="h-3.5 w-3.5" />
                              Projects ({projectCount})
                            </TabsTrigger>
                          </TabsList>

                          {/* Lessons Tab */}
                          <TabsContent value="lessons">
                            {lessonCount === 0 ? (
                              <p className="text-sm text-muted-foreground py-2">
                                No lessons in this module.
                              </p>
                            ) : (
                              <div className="space-y-2 py-1">
                                {(mod.lessons ?? []).map((lesson: any) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                                  >
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {lesson.title}
                                      </p>
                                      {lesson.description && (
                                        <p className="text-xs text-muted-foreground truncate">
                                          {lesson.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      {lesson.type && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {lesson.type}
                                        </Badge>
                                      )}
                                      {lesson.estimated_minutes && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {lesson.estimated_minutes}m
                                        </span>
                                      )}
                                      {lesson.xp_reward && (
                                        <span
                                          className="text-xs flex items-center gap-1"
                                          style={{ color: "#1CB0F6" }}
                                        >
                                          <Zap className="h-3 w-3" />
                                          {lesson.xp_reward} XP
                                        </span>
                                      )}
                                      <DeleteConfirmDialog
                                        title="Delete Lesson"
                                        description={`Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`}
                                        onConfirm={deleteLesson.bind(
                                          null,
                                          lesson.id
                                        )}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TabsContent>

                          {/* Quizzes Tab */}
                          <TabsContent value="quizzes">
                            {quizCount === 0 ? (
                              <p className="text-sm text-muted-foreground py-2">
                                No quizzes in this module.
                              </p>
                            ) : (
                              <div className="space-y-2 py-1">
                                {(mod.quizzes ?? []).map((quiz: any) => (
                                  <div
                                    key={quiz.id}
                                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                                  >
                                    <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {quiz.title}
                                      </p>
                                      {quiz.description && (
                                        <p className="text-xs text-muted-foreground truncate">
                                          {quiz.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {quiz.question_count ?? 0} questions
                                      </Badge>
                                      {quiz.time_limit_minutes && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {quiz.time_limit_minutes}m
                                        </span>
                                      )}
                                      {quiz.xp_reward && (
                                        <span
                                          className="text-xs flex items-center gap-1"
                                          style={{ color: "#1CB0F6" }}
                                        >
                                          <Zap className="h-3 w-3" />
                                          {quiz.xp_reward} XP
                                        </span>
                                      )}
                                      <DeleteConfirmDialog
                                        title="Delete Quiz"
                                        description={`Are you sure you want to delete "${quiz.title}" and all its questions? This action cannot be undone.`}
                                        onConfirm={deleteQuiz.bind(
                                          null,
                                          quiz.id
                                        )}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TabsContent>

                          {/* Assignments Tab */}
                          <TabsContent value="assignments">
                            {assignmentCount === 0 ? (
                              <p className="text-sm text-muted-foreground py-2">
                                No assignments in this module.
                              </p>
                            ) : (
                              <div className="space-y-2 py-1">
                                {(mod.assignments ?? []).map(
                                  (assignment: any) => (
                                    <div
                                      key={assignment.id}
                                      className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                                    >
                                      <FileCode className="h-4 w-4 text-muted-foreground shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {assignment.title}
                                        </p>
                                        {assignment.description && (
                                          <p className="text-xs text-muted-foreground truncate">
                                            {assignment.description}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 shrink-0">
                                        {assignment.difficulty && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {assignment.difficulty}
                                          </Badge>
                                        )}
                                        {assignment.language && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {assignment.language}
                                          </Badge>
                                        )}
                                        {assignment.xp_reward && (
                                          <span
                                            className="text-xs flex items-center gap-1"
                                            style={{ color: "#1CB0F6" }}
                                          >
                                            <Zap className="h-3 w-3" />
                                            {assignment.xp_reward} XP
                                          </span>
                                        )}
                                        <DeleteConfirmDialog
                                          title="Delete Assignment"
                                          description={`Are you sure you want to delete "${assignment.title}"? This action cannot be undone.`}
                                          onConfirm={deleteAssignment.bind(
                                            null,
                                            assignment.id
                                          )}
                                        />
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </TabsContent>

                          {/* Projects Tab */}
                          <TabsContent value="projects">
                            {projectCount === 0 ? (
                              <p className="text-sm text-muted-foreground py-2">
                                No projects in this module.
                              </p>
                            ) : (
                              <div className="space-y-2 py-1">
                                {(mod.projects ?? []).map((project: any) => (
                                  <div
                                    key={project.id}
                                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                                  >
                                    <FolderKanban className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {project.title}
                                      </p>
                                      {project.description && (
                                        <p className="text-xs text-muted-foreground truncate">
                                          {project.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      {project.difficulty && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {project.difficulty}
                                        </Badge>
                                      )}
                                      {project.language && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {project.language}
                                        </Badge>
                                      )}
                                      {project.xp_reward && (
                                        <span
                                          className="text-xs flex items-center gap-1"
                                          style={{ color: "#1CB0F6" }}
                                        >
                                          <Zap className="h-3 w-3" />
                                          {project.xp_reward} XP
                                        </span>
                                      )}
                                      <DeleteConfirmDialog
                                        title="Delete Project"
                                        description={`Are you sure you want to delete "${project.title}"? This action cannot be undone.`}
                                        onConfirm={deleteProject.bind(
                                          null,
                                          project.id
                                        )}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
