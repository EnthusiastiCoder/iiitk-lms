import type { Metadata } from "next";
import { serverFetch } from "@/lib/server-api";
import type { Course, Enrollment, LessonCompletion } from "@lms/shared";

export const metadata: Metadata = {
  title: "Courses | IIIT Kalyani LMS",
};
import { CoursesCatalog } from "@/components/courses/CoursesCatalog";

export default async function CoursesPage() {
  const [courses, enrollments, completions] = await Promise.all([
    serverFetch<Course[]>("/courses"),
    serverFetch<Enrollment[]>("/enrollments"),
    serverFetch<LessonCompletion[]>("/enrollments/completions"),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <p className="text-muted-foreground">
          Browse and enroll in courses
        </p>
      </div>
      <CoursesCatalog
        courses={courses ?? []}
        enrollments={enrollments ?? []}
        completions={completions ?? []}
      />
    </div>
  );
}
