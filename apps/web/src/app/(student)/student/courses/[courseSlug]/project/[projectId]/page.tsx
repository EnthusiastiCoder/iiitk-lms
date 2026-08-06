import { serverFetch } from "@/lib/server-api";
import { notFound } from "next/navigation";
import { CodeSubmission } from "@/components/submissions/CodeSubmission";

interface Project {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  xp_reward: number | null;
  language: string | null;
  starter_code: string | null;
  requirements: string[] | null;
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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ courseSlug: string; projectId: string }>;
}) {
  const { courseSlug, projectId } = await params;

  const data = await serverFetch<{
    project: Project;
    submission: Submission | null;
  }>(`/projects/${projectId}`);

  if (!data?.project) notFound();

  const { project, submission: existingSubmission } = data;

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
