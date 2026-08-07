"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bug, ArrowLeft, Send, ImageIcon, Calendar, User, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/motion/fade-in";
import { bugs as bugsApi } from "@/lib/api";

interface Comment {
  id: string;
  bug_id: string;
  user_id: string;
  user_name: string;
  message: string;
  is_system: boolean;
  created_at: string;
}

interface BugData {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  reporter_id: string;
  reporter_name: string;
  screenshot_urls: string[];
  created_at: string;
  updated_at: string;
  comments: Comment[];
}

type ColorPair = { bg: string; text: string };
const severityColors: Record<string, ColorPair> = {
  critical: { bg: "rgba(239,68,68,0.15)", text: "#EF4444" },
  high: { bg: "rgba(249,115,22,0.15)", text: "#F97316" },
  medium: { bg: "rgba(234,179,8,0.15)", text: "#EAB308" },
  low: { bg: "rgba(34,197,94,0.15)", text: "#22C55E" },
};
const statusColors: Record<string, ColorPair> = {
  open: { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
  in_progress: { bg: "rgba(234,179,8,0.15)", text: "#EAB308" },
  resolved: { bg: "rgba(34,197,94,0.15)", text: "#22C55E" },
  closed: { bg: "rgba(107,114,128,0.15)", text: "#6B7280" },
};

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

export function BugDetailClient({ bug }: { bug: BugData }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [enlargedImg, setEnlargedImg] = useState<string | null>(null);

  const sev = severityColors[bug.severity] ?? severityColors.low;
  const stat = statusColors[bug.status] ?? statusColors.open;
  const screenshots = bug.screenshot_urls ?? [];
  const comments = bug.comments ?? [];
  const isClosed = bug.status === "closed";

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSending(true);
    try { await bugsApi.comment(bug.id, comment.trim()); setComment(""); router.refresh(); }
    catch { /* noop */ } finally { setSending(false); }
  };

  const handleToggleStatus = async () => {
    setToggling(true);
    try { await (isClosed ? bugsApi.reopen(bug.id) : bugsApi.close(bug.id)); router.refresh(); }
    catch { /* noop */ } finally { setToggling(false); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <FadeIn>
        {/* Back link */}
        <Link
          href="/tester/bugs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bugs
        </Link>

        {/* Bug header */}
        <Card className="mb-4">
          <CardContent className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <h1 className="text-xl font-bold flex items-start gap-2">
                <Bug
                  className="h-5 w-5 mt-1 shrink-0"
                  style={{ color: "#F59E0B" }}
                />
                {bug.title}
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                disabled={toggling}
              >
                {toggling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : null}
                {isClosed ? "Reopen" : "Close Bug"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: sev.bg,
                  color: sev.text,
                  borderColor: "transparent",
                }}
              >
                {bug.severity}
              </Badge>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: stat.bg,
                  color: stat.text,
                  borderColor: "transparent",
                }}
              >
                {bug.status.replace("_", " ")}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                {bug.reporter_name}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {fmtDate(bug.created_at)}
              </span>
            </div>

            {/* Description */}
            <div
              className="text-sm leading-relaxed whitespace-pre-wrap rounded-lg p-4"
              style={{ backgroundColor: "rgba(128,128,128,0.06)" }}
            >
              {bug.description}
            </div>

            {/* Screenshots */}
            {screenshots.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4" />
                  Screenshots ({screenshots.length})
                </p>
                <div className="flex flex-wrap gap-3">
                  {screenshots.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setEnlargedImg(url)}
                      className="w-32 h-32 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-amber-500/40 transition-all"
                    >
                      <img
                        src={url}
                        alt={`Screenshot ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Comments */}
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No comments yet. Be the first to comment.
              </p>
            ) : (
              <div className="space-y-4 mb-6">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg p-3"
                    style={{
                      borderLeft: c.is_system
                        ? "3px solid #8B5CF6"
                        : "3px solid rgba(128,128,128,0.2)",
                      backgroundColor: c.is_system
                        ? "rgba(139, 92, 246, 0.06)"
                        : "rgba(128,128,128,0.04)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: c.is_system ? "#8B5CF6" : undefined,
                          fontStyle: c.is_system ? "italic" : undefined,
                        }}
                      >
                        {c.is_system ? "Claude" : c.user_name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {fmtDate(c.created_at)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{c.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment form */}
            <form
              onSubmit={handleComment}
              className="flex gap-2 items-end pt-2 border-t border-border"
            >
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="flex-1 mt-2"
              />
              <Button
                type="submit"
                disabled={sending || !comment.trim()}
                size="sm"
                style={{ backgroundColor: "#F59E0B", color: "#000" }}
                className="hover:opacity-90 shrink-0 mb-0.5"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Enlarged image overlay */}
      {enlargedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setEnlargedImg(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
            onClick={() => setEnlargedImg(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={enlargedImg}
            alt="Enlarged screenshot"
            className="max-w-full max-h-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
