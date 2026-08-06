"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Logger } from "@/lib/logger";

const log = new Logger("upload");

export async function addFileToSubmission(
  submissionId: string,
  table: "assignment_submissions" | "project_submissions",
  fileUrl: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: submission } = await supabase
    .from(table)
    .select("file_urls, user_id")
    .eq("id", submissionId)
    .single();

  if (!submission) throw new Error("Submission not found");
  if (submission.user_id !== user.id) throw new Error("Not authorized");

  const currentUrls: string[] = submission.file_urls ?? [];
  const updatedUrls = [...currentUrls, fileUrl];

  log.info("file_url.persist", { submissionId, table, userId: user.id, fileCount: updatedUrls.length });

  await supabase
    .from(table)
    .update({ file_urls: updatedUrls })
    .eq("id", submissionId);

  revalidatePath("/student/submissions");
  return { success: true, file_urls: updatedUrls };
}
