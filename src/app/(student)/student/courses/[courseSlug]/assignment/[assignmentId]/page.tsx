import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CodeSubmission } from "@/components/submissions/CodeSubmission";

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ courseSlug: string; assignmentId: string }>;
}) {
  const { courseSlug, assignmentId } = await params;
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", assignmentId)
    .single();

  if (!assignment) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingSubmission = null;
  if (user) {
    const { data } = await supabase
      .from("assignment_submissions")
      .select("code, status, grade, feedback, submitted_at")
      .eq("assignment_id", assignmentId)
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    existingSubmission = data;
  }

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
