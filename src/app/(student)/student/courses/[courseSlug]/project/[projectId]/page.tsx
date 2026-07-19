import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CodeSubmission } from "@/components/submissions/CodeSubmission";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ courseSlug: string; projectId: string }>;
}) {
  const { courseSlug, projectId } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingSubmission = null;
  if (user) {
    const { data } = await supabase
      .from("project_submissions")
      .select("code, status, grade, feedback, submitted_at")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    existingSubmission = data;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <CodeSubmission
        itemId={projectId}
        courseId={project.course_id}
        courseSlug={courseSlug}
        title={project.title}
        description={project.description ?? ""}
        difficulty={project.difficulty ?? "medium"}
        xpReward={project.xp_reward ?? 0}
        language={project.language ?? "python"}
        starterCode={project.starter_code}
        requirements={project.requirements}
        dueDate={null}
        type="project"
        existingSubmission={existingSubmission}
      />
    </div>
  );
}
