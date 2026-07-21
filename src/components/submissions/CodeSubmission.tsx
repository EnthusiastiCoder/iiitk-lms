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
  Clock,
  Code2,
  Loader2,
  Send,
  Zap,
} from "lucide-react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { FileUploader, MAX_FILE_SIZE_MB } from "./FileUploader";
import { SubmissionStatus } from "./SubmissionStatus";
import type { ExistingSubmission } from "./SubmissionStatus";

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
  existingSubmission?: ExistingSubmission | null;
}

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

      {/* Submission Status */}
      <SubmissionStatus
        existingSubmission={existingSubmission}
        submitted={submitted}
        type={type}
        courseSlug={courseSlug}
      />

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
          <FileUploader
            uploadedFiles={uploadedFiles}
            isUploading={isUploading}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            getFileName={getFileName}
            getDownloadUrl={getDownloadUrl}
            fileInputRef={fileInputRef}
          />

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
