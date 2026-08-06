import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserCompletions } from "@/actions/courses";
import { Logger, safeFetch } from "@/lib/logger";

const log = new Logger("student-skill-tree");

export const metadata: Metadata = {
  title: "Skill Tree | IIIT Kalyani LMS",
};
import { Route } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { SkillTreeView } from "@/components/skill-tree/SkillTreeView";

interface Props {
  searchParams: Promise<{ course?: string }>;
}

export default async function SkillTreePage({ searchParams }: Props) {
  const { course: selectedCourseId } = await searchParams;
  const supabase = await createClient();

  // Find all courses that have skill tree nodes
  const { data: treeCourseIds } = await supabase
    .from("skill_tree_nodes")
    .select("course_id")
    .limit(100);

  const uniqueCourseIds = [
    ...new Set((treeCourseIds ?? []).map((r: { course_id: string }) => r.course_id)),
  ];

  if (uniqueCourseIds.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-brand/10">
            <Route className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Skill Tree</h1>
            <p className="text-muted-foreground">
              No skill tree data available yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch course metadata for those courses
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, accent_color")
    .in("id", uniqueCourseIds)
    .order("title");

  const courseList = courses ?? [];
  const activeCourseId = selectedCourseId ?? courseList[0]?.id;
  const activeCourse = courseList.find((c: { id: string; title: string; accent_color: string }) => c.id === activeCourseId);
  const courseColor = activeCourse?.accent_color ?? "#58CC02";

  // Fetch nodes and edges for the active course
  const [{ data: nodes }, { data: edges }] = await Promise.all([
    supabase
      .from("skill_tree_nodes")
      .select("*")
      .eq("course_id", activeCourseId)
      .order("y")
      .order("x"),
    supabase
      .from("skill_tree_edges")
      .select("*")
      .eq("course_id", activeCourseId),
  ]);

  // Fetch user lesson completions to determine node status
  const completions = await safeFetch(() => getUserCompletions(activeCourseId), log) ?? [];
  const completedLessonIds = new Set(
    completions.map((c: { lesson_id: string }) => c.lesson_id)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand/10">
              <Route className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Skill Tree</h1>
              <p className="text-muted-foreground text-sm">
                Track your learning journey across connected skills
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Course selector tabs */}
      <FadeIn delay={0.1}>
        <div className="flex gap-2 mb-6 flex-wrap">
          {courseList.map((course: { id: string; title: string; accent_color: string }) => (
            <a
              key={course.id}
              href={`/student/skill-tree?course=${course.id}`}
              className={
                course.id === activeCourseId
                  ? "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
                  : "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              }
              style={
                course.id === activeCourseId
                  ? { backgroundColor: course.accent_color ?? "#58CC02" }
                  : undefined
              }
            >
              {course.title}
            </a>
          ))}
        </div>
      </FadeIn>

      {/* Skill tree visualization */}
      <FadeIn delay={0.2}>
        <Card>
          <CardContent className="pt-2">
            <SkillTreeView
              nodes={nodes ?? []}
              edges={edges ?? []}
              completedLessonIds={completedLessonIds}
              courseColor={courseColor}
            />
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
