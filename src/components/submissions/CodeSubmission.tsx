"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { submitAssignment, submitProject } from "@/actions/submissions";
import { addFileToSubmission } from "@/actions/upload";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code2,
  Download,
  FileUp,
  Loader2,
  Paperclip,
  Send,
  Trash2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeEditor } from "@/components/editor/CodeEditor";

interface CodeSubmissionProps {
  itemId: string;
  courseId: string;
  courseSlug: string;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  language: string;
  starterCode: string | null;
  requirements: string[] | null;
  dueDate: string | null;
  type: "assignment" | "project";
  existingSubmission?: {
    id: string;
    code: string;
    status: string;
    grade: number | null;
    feedback: string | null;
    submitted_at: string;
    file_urls: string[] | null;
  } | null;
}

const ACCEPTED_FILE_TYPES = ".pdf,.png,.jpg,.jpeg,.gif,.zip";
const MAX_FILE_SIZE_MB = 10;

export function CodeSubmission({
  itemId,
  courseId,
  courseSlug,
  title,
  description,
  difficulty,
  xpReward,
  language,
  starterCode,
  requirements,
  dueDate,
  type,
  existingSubmission,
}: CodeSubmissionProps) {
  const [code, setCode] = useState(
    existingSubmission?.code ?? starterCode ?? ""
  );
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(
    existingSubmission?.file_urls ?? []
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submissionTable =
    type === "assignment"
      ? ("assignment_submissions" as const)
      : ("project_submissions" as const);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File must be smaller than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const ext = file.name.split(".").pop();
      const filePath = `${userId}/${itemId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload failed:", uploadError);
        alert("File upload failed. Please try again.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("submissions").getPublicUrl(filePath);

      // If there's an existing submission, persist to DB immediately
      if (existingSubmission?.id) {
        await addFileToSubmission(
          existingSubmission.id,
          submissionTable,
          filePath
        );
      }

      setUploadedFiles((prev) => [...prev, filePath]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async (filePath: string) => {
    const supabase = createClient();
    await supabase.storage.from("submissions").remove([filePath]);
    setUploadedFiles((prev) => prev.filter((f) => f !== filePath));
  };

  const getFileName = (filePath: string) => {
    const parts = filePath.split("/");
    const name = parts[parts.length - 1];
    // Strip the timestamp prefix
    const dashIndex = name.indexOf("-");
    return dashIndex !== -1 ? name.substring(dashIndex + 1) : name;
  };

  const getDownloadUrl = (filePath: string) => {
    const supabase = createClient();
    const {
      data: { publicUrl },
    } = supabase.storage.from("submissions").getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSubmit = () => {
    if (!code.trim()) return;
    startTransition(async () => {
      if (type === "assignment") {
        await submitAssignment(itemId, courseId, code, uploadedFiles);
      } else {
        await submitProject(itemId, courseId, code, uploadedFiles);
      }
      setSubmitted(true);
    });
  };

  const isAlreadySubmitted = !!existingSubmission;
  const isGraded = existingSubmission?.status === "graded";
  const isPendingReview = existingSubmission?.status === "pending";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href={`/student/courses/${courseSlug}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="capitalize">
            {type}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {difficulty}
          </Badge>
          <Badge variant="secondary">
            <Code2 className="h-3 w-3 mr-1" />
            {language}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-brand" />
            {xpReward} XP
          </span>
          {dueDate && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Due: {new Date(dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Requirements */}
      {requirements && requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {requirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-brand mt-0.5">-</span>
                  {req}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Existing Submission Status */}
      {isPendingReview && !submitted && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Submission pending review
                </p>
                <p className="text-sm text-muted-foreground">
                  Submitted on{" "}
                  {new Date(existingSubmission!.submitted_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isGraded && !submitted && (
        <Card className="border-brand/30 bg-brand/5">
          <CardContent className="py-4 space-y-2">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-brand" />
              <div>
                <p className="font-medium text-brand">Graded</p>
                <p className="text-sm text-muted-foreground">
                  Score: {existingSubmission!.grade}/100
                </p>
              </div>
            </div>
            {existingSubmission!.feedback && (
              <p className="text-sm text-muted-foreground pl-8">
                Feedback: {existingSubmission!.feedback}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success message */}
      {submitted && (
        <Card className="border-brand/30 bg-brand/5">
          <CardContent className="py-6 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-brand mx-auto" />
            <p className="font-semibold text-lg">Submitted successfully!</p>
            <p className="text-sm text-muted-foreground">
              Your {type} has been submitted for review.
            </p>
            <Link href={`/student/courses/${courseSlug}`}>
              <Button variant="outline" className="mt-3">
                <ArrowLeft className="h-4 w-4" />
                Back to Course
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Code Editor */}
      {!submitted && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isAlreadySubmitted ? "Update your code" : "Your Code"}
            </label>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              height="500px"
            />
          </div>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Supporting Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4" />
                      Upload File
                    </>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  PDF, images, or ZIP. Max {MAX_FILE_SIZE_MB}MB.
                </span>
              </div>

              {uploadedFiles.length > 0 && (
                <ul className="space-y-2">
                  {uploadedFiles.map((filePath) => (
                    <li
                      key={filePath}
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="truncate flex-1 min-w-0">
                        {getFileName(filePath)}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={getDownloadUrl(filePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleRemoveFile(filePath)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Link href={`/student/courses/${courseSlug}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
            </Link>
            <Button
              className="bg-brand hover:bg-brand-dark text-white"
              onClick={handleSubmit}
              disabled={isPending || !code.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit {type === "assignment" ? "Assignment" : "Project"}
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
