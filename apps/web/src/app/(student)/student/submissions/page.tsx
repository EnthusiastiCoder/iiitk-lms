import type { Metadata } from "next";
import { getUserSubmissions } from "@/actions/submissions";

export const metadata: Metadata = {
  title: "Submissions | IIIT Kalyani LMS",
};
import { Send, FileCode, FolderCode, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FadeIn } from "@/components/motion/fade-in";

interface SubmissionBase {
  id: string;
  assignment_id?: string;
  project_id?: string;
  status: string;
  grade: number | null;
  submitted_at: string | null;
  feedback: string | null;
}

type SubmissionRow = SubmissionBase & { _type: "assignment" | "project" };

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pending", variant: "secondary" },
  graded: { label: "Graded", variant: "default" },
  submitted: { label: "Submitted", variant: "outline" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SubmissionRow({
  title,
  type,
  status,
  grade,
  date,
  feedback,
}: {
  title: string;
  type: "assignment" | "project";
  status: string;
  grade: number | null;
  date: string | null;
  feedback: string | null;
}) {
  const config = statusConfig[status] ?? statusConfig.pending;
  const Icon = type === "assignment" ? FileCode : FolderCode;

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className="p-2 rounded-lg bg-muted shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">
          {type === "assignment" ? "Assignment" : "Project"} &middot;{" "}
          {formatDate(date)}
        </p>
        {feedback && status === "graded" && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            Feedback: {feedback}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {grade !== null && status === "graded" && (
          <span
            className="text-sm font-bold"
            style={{
              color: grade >= 70 ? "#58CC02" : grade >= 40 ? "#FF9600" : "#EA2B2B",
            }}
          >
            {grade}%
          </span>
        )}
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
    </div>
  );
}

export default async function SubmissionsPage() {
  const { assignments, projects } = await getUserSubmissions();

  const allSubmissions = [
    ...assignments.map((a: SubmissionBase) => ({ ...a, _type: "assignment" as const })),
    ...projects.map((p: SubmissionBase) => ({ ...p, _type: "project" as const })),
  ].sort(
    (a, b) =>
      new Date(b.submitted_at ?? 0).getTime() -
      new Date(a.submitted_at ?? 0).getTime()
  );

  const pending = allSubmissions.filter((s) => s.status === "pending");
  const graded = allSubmissions.filter((s) => s.status === "graded");

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand/10">
              <Send className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Submissions</h1>
              <p className="text-sm text-muted-foreground">
                Your assignment and project submissions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-brand">{graded.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase">
                Graded
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-streak">{pending.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase">
                Pending
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Tabs defaultValue="all">
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="all">
              All ({allSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="graded">
              Graded ({graded.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0 px-4">
                {allSubmissions.length > 0 ? (
                  allSubmissions.map((sub: SubmissionRow) => (
                    <SubmissionRow
                      key={sub.id}
                      title={
                        sub.assignment_id ??
                        sub.project_id ??
                        "Untitled"
                      }
                      type={sub._type}
                      status={sub.status}
                      grade={sub.grade}
                      date={sub.submitted_at}
                      feedback={sub.feedback}
                    />
                  ))
                ) : (
                  <EmptyState />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-0 px-4">
                {pending.length > 0 ? (
                  pending.map((sub: SubmissionRow) => (
                    <SubmissionRow
                      key={sub.id}
                      title={
                        sub.assignment_id ??
                        sub.project_id ??
                        "Untitled"
                      }
                      type={sub._type}
                      status={sub.status}
                      grade={sub.grade}
                      date={sub.submitted_at}
                      feedback={sub.feedback}
                    />
                  ))
                ) : (
                  <EmptyState message="No pending submissions." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graded">
            <Card>
              <CardContent className="p-0 px-4">
                {graded.length > 0 ? (
                  graded.map((sub: SubmissionRow) => (
                    <SubmissionRow
                      key={sub.id}
                      title={
                        sub.assignment_id ??
                        sub.project_id ??
                        "Untitled"
                      }
                      type={sub._type}
                      status={sub.status}
                      grade={sub.grade}
                      date={sub.submitted_at}
                      feedback={sub.feedback}
                    />
                  ))
                ) : (
                  <EmptyState message="No graded submissions yet." />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />
      <p>{message ?? "No submissions yet. Submit your work to see it here."}</p>
    </div>
  );
}
