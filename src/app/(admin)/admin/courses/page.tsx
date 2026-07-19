import { getAllCourses, getProfessorList } from "@/actions/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Plus } from "lucide-react";
import { CreateCourseDialog } from "@/components/admin/CreateCourseDialog";
import { CourseActions } from "@/components/admin/CourseActions";

export default async function AdminCoursesPage() {
  let courses: any[] = [];
  let professors: any[] = [];

  try {
    courses = await getAllCourses();
  } catch {
    // No data
  }

  try {
    professors = await getProfessorList();
  } catch {
    // No professors
  }

  const totalEnrollments = courses.reduce(
    (sum, c) => sum + c.enrollment_count,
    0
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-muted-foreground text-sm">
            {courses.length} course{courses.length !== 1 ? "s" : ""} |{" "}
            {totalEnrollments} total enrollment
            {totalEnrollments !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateCourseDialog />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 pt-2">
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: "rgba(255, 75, 75, 0.1)" }}
            >
              <BookOpen className="h-5 w-5" style={{ color: "#FF4B4B" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-2">
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: "rgba(255, 75, 75, 0.1)" }}
            >
              <Users className="h-5 w-5" style={{ color: "#FF4B4B" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEnrollments}</p>
              <p className="text-sm text-muted-foreground">
                Total Enrollments
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-2">
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: "rgba(255, 75, 75, 0.1)" }}
            >
              <Users className="h-5 w-5" style={{ color: "#FF4B4B" }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{professors.length}</p>
              <p className="text-sm text-muted-foreground">Professors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No courses found. Create your first course to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="rounded-lg p-2 shrink-0"
                    style={{
                      backgroundColor: course.accent_color
                        ? `${course.accent_color}15`
                        : "rgba(255, 75, 75, 0.1)",
                    }}
                  >
                    <BookOpen
                      className="h-5 w-5"
                      style={{
                        color: course.accent_color || "#FF4B4B",
                      }}
                    />
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0"
                    style={{
                      backgroundColor: "rgba(255, 75, 75, 0.1)",
                      color: "#FF4B4B",
                    }}
                  >
                    {course.enrollment_count} enrolled
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">
                  {course.title}
                </CardTitle>
                <CardDescription>
                  {course.description
                    ? course.description.length > 80
                      ? course.description.slice(0, 80) + "..."
                      : course.description
                    : "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {course.difficulty && (
                    <Badge variant="outline" className="text-xs">
                      {course.difficulty}
                    </Badge>
                  )}
                  {course.category && (
                    <Badge variant="secondary" className="text-xs">
                      {course.category}
                    </Badge>
                  )}
                </div>
                <CourseActions
                  courseId={course.id}
                  courseTitle={course.title}
                  currentInstructorId={course.instructor_id}
                  professors={professors}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
