import { getCourseWithModules } from "@/actions/courses";
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
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Users,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  let course: any = null;
  try {
    course = await getCourseWithModules(courseSlug);
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

      {/* Module Accordion */}
      <h2 className="text-lg font-semibold mb-4">Modules & Lessons</h2>
      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No modules have been added to this course yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-2">
            <Accordion>
              {modules.map((mod: any) => (
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
                        {mod.lessons?.length ?? 0} lessons
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    {(mod.lessons ?? []).length === 0 ? (
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
                                <Badge variant="outline" className="text-xs">
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
                                <span className="text-xs flex items-center gap-1" style={{ color: "#1CB0F6" }}>
                                  <Zap className="h-3 w-3" />
                                  {lesson.xp_reward} XP
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
