import { serverFetch } from "@/lib/server-api";
import type { CourseWithModules, Lesson, LessonCompletion } from "@lms/shared";
import { notFound } from "next/navigation";
import { LessonViewer } from "@/components/courses/LessonViewer";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) {
  const { courseSlug, lessonId } = await params;

  const [lesson, course, flashcardDeck] = await Promise.all([
    serverFetch<Lesson>(`/lessons/${lessonId}`),
    serverFetch<CourseWithModules>(`/courses/${courseSlug}/full`),
    serverFetch<unknown>(`/lessons/${lessonId}/flashcards`),
  ]);

  if (!lesson || !course) notFound();

  const completions = await serverFetch<LessonCompletion[]>(
    `/enrollments/completions?courseId=${course.id}`
  );
  const completedIds = (completions ?? []).map((c: { lesson_id: string }) => c.lesson_id);

  // Build flat ordered lesson list for prev/next navigation
  type ModuleWithLessons = CourseWithModules["modules"][number];
  const allLessons = course.modules
    .sort((a: ModuleWithLessons, b: ModuleWithLessons) => a.order - b.order)
    .flatMap((m: ModuleWithLessons) =>
      m.lessons.sort((a: Lesson, b: Lesson) => a.order - b.order)
    );

  const currentIndex = allLessons.findIndex((l: Lesson) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  return (
    <div className="h-full flex">
      <LessonViewer
        lesson={lesson}
        course={{
          id: course.id,
          title: course.title,
          accent_color: course.accent_color,
          modules: course.modules,
        }}
        courseSlug={courseSlug}
        completedLessonIds={completedIds}
        prevLesson={
          prevLesson
            ? { id: prevLesson.id, title: prevLesson.title }
            : null
        }
        nextLesson={
          nextLesson
            ? { id: nextLesson.id, title: nextLesson.title }
            : null
        }
        flashcardDeck={flashcardDeck}
      />
    </div>
  );
}
