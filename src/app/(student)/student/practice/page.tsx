import { createClient } from "@/lib/supabase/server";
import { getUserEnrollments } from "@/actions/courses";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Zap,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";

function formatTime(seconds: number | null) {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  if (mins < 1) return `${seconds}s`;
  return `${mins}m`;
}

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const enrollments = await getUserEnrollments();
  const enrolledCourseIds = enrollments.map((e: any) => e.course_id);

  let quizzes: any[] = [];
  let attempts: any[] = [];
  let courses: any[] = [];

  if (enrolledCourseIds.length > 0) {
    const [quizResult, attemptResult, courseResult] = await Promise.all([
      supabase
        .from("quizzes")
        .select("*")
        .in("course_id", enrolledCourseIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user!.id)
        .order("completed_at", { ascending: false }),
      supabase
        .from("courses")
        .select("id, title, slug")
        .in("id", enrolledCourseIds),
    ]);

    quizzes = quizResult.data ?? [];
    attempts = attemptResult.data ?? [];
    courses = courseResult.data ?? [];
  }

  const courseMap = new Map(courses.map((c: any) => [c.id, c]));
  const attemptsByQuiz = new Map<string, any[]>();
  for (const attempt of attempts) {
    const existing = attemptsByQuiz.get(attempt.quiz_id) ?? [];
    existing.push(attempt);
    attemptsByQuiz.set(attempt.quiz_id, existing);
  }

  // Group quizzes by course
  const groupedByCourse = new Map<string, any[]>();
  for (const quiz of quizzes) {
    const courseId = quiz.course_id;
    const existing = groupedByCourse.get(courseId) ?? [];
    existing.push(quiz);
    groupedByCourse.set(courseId, existing);
  }

  const completedCount = quizzes.filter(
    (q: any) => (attemptsByQuiz.get(q.id)?.length ?? 0) > 0
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand/10">
              <ClipboardList className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Practice</h1>
              <p className="text-sm text-muted-foreground">
                Take quizzes to test your knowledge
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-brand">{completedCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase">
                Attempted
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{quizzes.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase">
                Available
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {groupedByCourse.size > 0 ? (
        Array.from(groupedByCourse.entries()).map(
          ([courseId, courseQuizzes], groupIndex) => {
            const course = courseMap.get(courseId);
            return (
              <FadeIn key={courseId} delay={0.1 + groupIndex * 0.05}>
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {course?.title ?? "Unknown Course"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {courseQuizzes.map((quiz: any) => {
                      const quizAttempts = attemptsByQuiz.get(quiz.id) ?? [];
                      const hasAttempted = quizAttempts.length > 0;
                      const bestScore = hasAttempted
                        ? Math.max(
                            ...quizAttempts.map((a: any) => a.score ?? 0)
                          )
                        : null;
                      const lastAttempt = quizAttempts[0];

                      return (
                        <Card key={quiz.id}>
                          <CardContent className="pt-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-sm font-semibold line-clamp-2">
                                {quiz.title ?? "Quiz"}
                              </p>
                              {hasAttempted ? (
                                <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                              ) : (
                                <PlayCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              )}
                            </div>

                            {quiz.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {quiz.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2 flex-wrap">
                              {quiz.xp_reward && (
                                <Badge variant="outline" className="gap-1">
                                  <Zap className="h-3 w-3 text-brand" />
                                  {quiz.xp_reward} XP
                                </Badge>
                              )}

                              {hasAttempted && bestScore !== null && (
                                <Badge
                                  variant="secondary"
                                  style={{
                                    color:
                                      bestScore >= 70
                                        ? "#58CC02"
                                        : bestScore >= 40
                                          ? "#FF9600"
                                          : "#EA2B2B",
                                  }}
                                >
                                  Best: {bestScore}%
                                </Badge>
                              )}

                              {hasAttempted &&
                                lastAttempt?.time_spent_seconds && (
                                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(
                                      lastAttempt.time_spent_seconds
                                    )}
                                  </span>
                                )}

                              {!hasAttempted && (
                                <Badge variant="secondary">Not attempted</Badge>
                              )}
                            </div>

                            {hasAttempted && (
                              <p className="text-[10px] text-muted-foreground mt-2">
                                {quizAttempts.length} attempt
                                {quizAttempts.length !== 1 ? "s" : ""}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            );
          }
        )
      ) : (
        <FadeIn delay={0.1}>
          <div className="py-16 text-center text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No quizzes available</p>
            <p className="text-sm mt-1">
              Enroll in a course to access practice quizzes.
            </p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
