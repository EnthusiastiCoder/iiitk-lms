import type { Metadata } from "next";
import { serverFetch } from "@/lib/server-api";
import type { Course, CourseWithModules, Enrollment, LessonCompletion } from "@lms/shared";
import { notFound } from "next/navigation";
import { BookOpen, Clock, Zap, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CourseModules } from "@/components/courses/CourseModules";
import { EnrollButton } from "@/components/courses/EnrollButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await serverFetch<Course>(`/courses/${courseSlug}`);
  return {
    title: course
      ? `${course.title} | IIIT Kalyani LMS`
      : "Course | IIIT Kalyani LMS",
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = await serverFetch<CourseWithModules>(`/courses/${courseSlug}/full`);
  if (!course) notFound();

  const [completions, enrollments] = await Promise.all([
    serverFetch<LessonCompletion[]>(`/enrollments/completions?courseId=${course.id}`),
    serverFetch<Enrollment[]>("/enrollments"),
  ]);

  const safeCompletions = completions ?? [];
  const safeEnrollments = enrollments ?? [];
  const isEnrolled = safeEnrollments.some((e: Enrollment) => e.course_id === course.id);
  const completedIds = new Set(safeCompletions.map((c: Pick<LessonCompletion, "lesson_id">) => c.lesson_id));
  const totalLessons =
    course.total_lessons ??
    course.modules.reduce(
      (sum: number, m: CourseWithModules["modules"][number]) => sum + m.lessons.length,
      0
    );
  const completedCount = completedIds.size;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      {/* Course Header */}
      <div
        className="rounded-xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${course.accent_color}, ${course.accent_color}cc)`,
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30 capitalize"
            >
              {course.difficulty}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30 capitalize"
            >
              {course.category}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {course.title}
          </h1>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            {course.long_description ?? course.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {totalLessons} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {course.estimated_hours} hours
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              {course.total_xp} XP
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              {course.modules.length} modules
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Modules */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Course Content</h2>
          <CourseModules
            modules={course.modules}
            courseSlug={courseSlug}
            completedLessonIds={Array.from(completedIds)}
          />
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-4 space-y-4">
            {/* Enroll Button or Progress Ring */}
            {!isEnrolled ? (
              <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  You are not enrolled in this course yet.
                </p>
                <EnrollButton courseId={course.id} />
              </div>
            ) : (
              <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-6 text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg
                    className="w-28 h-28 -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke={course.accent_color}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 52}
                      strokeDashoffset={
                        2 * Math.PI * 52 * (1 - progressPercent / 100)
                      }
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold">
                    {progressPercent}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {completedCount} of {totalLessons} lessons completed
                </p>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-4">
                <h3 className="text-sm font-semibold mb-2">Prerequisites</h3>
                <ul className="space-y-1">
                  {course.prerequisites.map((p: string, i: number) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-muted-foreground/50 mt-1">-</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-4">
                <h3 className="text-sm font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {course.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
