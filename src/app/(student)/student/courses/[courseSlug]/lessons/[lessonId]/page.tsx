import { getLessonContent, getFlashcardDeck } from "@/actions/lessons";
import { getCourseWithModules, getUserCompletions } from "@/actions/courses";
import { notFound } from "next/navigation";
import { LessonViewer } from "@/components/courses/LessonViewer";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) {
  const { courseSlug, lessonId } = await params;

  const [lesson, course, flashcardDeck] = await Promise.all([
    getLessonContent(lessonId),
    getCourseWithModules(courseSlug),
    getFlashcardDeck(lessonId),
  ]);

  if (!lesson || !course) notFound();

  const completions = await getUserCompletions(course.id);
  const completedIds = completions.map((c: any) => c.lesson_id);

  // Build flat ordered lesson list for prev/next navigation
  const allLessons = course.modules
    .sort((a: any, b: any) => a.order - b.order)
    .flatMap((m: any) =>
      m.lessons.sort((a: any, b: any) => a.order - b.order)
    );

  const currentIndex = allLessons.findIndex((l: any) => l.id === lessonId);
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
