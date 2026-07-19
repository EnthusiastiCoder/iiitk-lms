import { getPendingSubmissions, getRecentGraded } from "@/actions/professor";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  FileText,
  FolderKanban,
} from "lucide-react";

export default async function GradingPage() {
  let pending: any = { assignments: [], projects: [] };
  let graded: any = { assignments: [], projects: [] };

  try {
    pending = await getPendingSubmissions();
  } catch {
    // No data
  }
  try {
    graded = await getRecentGraded();
  } catch {
    // No data
  }

  const totalPending =
    pending.assignments.length + pending.projects.length;
  const totalGraded =
    graded.assignments.length + graded.projects.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Grading Center</h1>
          <p className="text-muted-foreground text-sm">
            Review and grade student submissions
          </p>
        </div>
        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: "rgba(28, 176, 246, 0.1)" }}
        >
          <ClipboardCheck className="h-5 w-5" style={{ color: "#1CB0F6" }} />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 pt-2">
            <div className="rounded-lg bg-amber-500/10 p-2.5">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPending}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-2">
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalGraded}</p>
              <p className="text-sm text-muted-foreground">Recently Graded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Submissions */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Pending Submissions
          </h2>

          {/* Pending Assignments */}
          {pending.assignments.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> Assignments
              </p>
              <div className="space-y-2">
                {pending.assignments.map((sub: any) => (
                  <Card key={sub.id} size="sm">
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {sub.profiles?.full_name ?? "Unknown Student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted{" "}
                          {sub.submitted_at
                            ? new Date(sub.submitted_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                        Pending
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pending Projects */}
          {pending.projects.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <FolderKanban className="h-3.5 w-3.5" /> Projects
              </p>
              <div className="space-y-2">
                {pending.projects.map((sub: any) => (
                  <Card key={sub.id} size="sm">
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {sub.profiles?.full_name ?? "Unknown Student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted{" "}
                          {sub.submitted_at
                            ? new Date(sub.submitted_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                        Pending
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {totalPending === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending submissions. All caught up!
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recently Graded */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Recently Graded
          </h2>

          {/* Graded Assignments */}
          {graded.assignments.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> Assignments
              </p>
              <div className="space-y-2">
                {graded.assignments.map((sub: any) => (
                  <Card key={sub.id} size="sm">
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {sub.profiles?.full_name ?? "Unknown Student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Graded{" "}
                          {sub.graded_at
                            ? new Date(sub.graded_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <Badge variant="default">
                        {sub.grade ?? sub.score ?? "Graded"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Graded Projects */}
          {graded.projects.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <FolderKanban className="h-3.5 w-3.5" /> Projects
              </p>
              <div className="space-y-2">
                {graded.projects.map((sub: any) => (
                  <Card key={sub.id} size="sm">
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {sub.profiles?.full_name ?? "Unknown Student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Graded{" "}
                          {sub.graded_at
                            ? new Date(sub.graded_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <Badge variant="default">
                        {sub.grade ?? sub.score ?? "Graded"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {totalGraded === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No recently graded submissions.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
