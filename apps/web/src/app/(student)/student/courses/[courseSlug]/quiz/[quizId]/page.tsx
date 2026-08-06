import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { QuizTaker } from "@/components/quiz/QuizTaker";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseSlug: string; quizId: string }>;
}) {
  const { courseSlug, quizId } = await params;
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (!quiz) notFound();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, type, question, options, correct_answer, explanation, xp_reward, \"order\"")
    .eq("quiz_id", quizId)
    .order("order");

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <QuizTaker
        quizId={quizId}
        courseSlug={courseSlug}
        title={quiz.title}
        description={quiz.description ?? ""}
        timeLimit={quiz.time_limit ?? 30}
        questions={questions ?? []}
      />
    </div>
  );
}
