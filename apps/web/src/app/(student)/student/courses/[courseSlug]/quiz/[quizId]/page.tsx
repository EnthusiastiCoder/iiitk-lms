import { serverFetch } from "@/lib/server-api";
import type { Quiz, QuizQuestion } from "@lms/shared";
import { notFound } from "next/navigation";
import { QuizTaker } from "@/components/quiz/QuizTaker";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseSlug: string; quizId: string }>;
}) {
  const { courseSlug, quizId } = await params;

  const data = await serverFetch<{ quiz: Quiz; questions: QuizQuestion[] }>(
    `/quizzes/${quizId}`
  );

  if (!data?.quiz) notFound();

  const { quiz, questions } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <QuizTaker
        quizId={quizId}
        courseSlug={courseSlug}
        title={quiz.title}
        description={quiz.description ?? ""}
        timeLimit={quiz.time_limit_minutes ?? 30}
        questions={questions ?? []}
      />
    </div>
  );
}
