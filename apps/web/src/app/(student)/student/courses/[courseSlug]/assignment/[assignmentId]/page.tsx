import { serverFetch } from "@/lib/server-api";
import { notFound } from "next/navigation";
import { CodeSubmission } from "@/components/submissions/CodeSubmission";

interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  xp_reward: number | null;
  language: string | null;
  starter_code: string | null;
  requirements: string[] | null;
  due_date: string | null;
}

interface Submission {
  id: string;
  code: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
  file_urls: string[] | null;
}

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ courseSlug: string; assignmentId: string }>;
}) {
  const { courseSlug, assignmentId } = await params;

  const data = await serverFetch<{
    assignment: Assignment;
    submission: Submission | null;
  }>(`/assignments/${assignmentId}`);

  if (!data?.assignment) notFound();

  const { assignment, submission: existingSubmission } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <CodeSubmission
        itemId={assignmentId}
        courseId={assignment.course_id}
        courseSlug={courseSlug}
        title={assignment.title}
        description={assignment.description ?? ""}
        difficulty={assignment.difficulty ?? "medium"}
        xpReward={assignment.xp_reward ?? 0}
        language={assignment.language ?? "python"}
        starterCode={assignment.starter_code}
        requirements={assignment.requirements}
        dueDate={assignment.due_date}
        type="assignment"
        existingSubmission={existingSubmission}
      />
    </div>
  );
}
