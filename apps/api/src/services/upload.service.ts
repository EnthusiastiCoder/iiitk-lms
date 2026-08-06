import { cloudinary } from "../config/cloudinary.js";
import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import type { UploadApiResponse } from "cloudinary";

const logger = new Logger("upload.service");

/** Result of a successful Cloudinary upload. */
interface UploadResult {
  url: string;
  publicId: string;
}

/** Allowed submission table names for file attachment. */
type SubmissionTable = "assignment_submissions" | "project_submissions";

/**
 * Upload a file buffer to Cloudinary.
 *
 * @param fileBuffer - The raw file buffer to upload.
 * @param fileName - Original file name (used as public_id base).
 * @param folder - Cloudinary folder path to store the file in.
 * @returns The secure URL and public ID of the uploaded asset.
 * @throws {BadRequestError} If the upload fails.
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  folder: string
): Promise<UploadResult> {
  const baseName = fileName.replace(/\.[^.]+$/, "");

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: baseName,
        resource_type: "auto",
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Upload returned no result"));
          return;
        }
        resolve(uploadResult);
      }
    );

    stream.end(fileBuffer);
  });

  logger.info("file_uploaded", {
    publicId: result.public_id,
    bytes: result.bytes,
    folder,
  });

  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * Attach a file URL to an existing submission record.
 *
 * Fetches the current `file_urls` array from the specified submission,
 * appends the new URL, and updates the record.
 *
 * @param submissionId - The UUID of the submission to update.
 * @param table - The submission table to query.
 * @param fileUrl - The file URL to append.
 * @returns The updated array of file URLs.
 * @throws {NotFoundError} If the submission does not exist.
 * @throws {BadRequestError} If the database update fails.
 */
export async function addFileToSubmission(
  submissionId: string,
  table: SubmissionTable,
  fileUrl: string
): Promise<string[]> {
  const { data: existing, error: fetchError } = await supabase
    .from(table)
    .select("file_urls")
    .eq("id", submissionId)
    .single();

  if (fetchError || !existing) {
    logger.warn("submission_not_found", { submissionId, table });
    throw new NotFoundError("Submission");
  }

  const currentUrls: string[] = existing.file_urls ?? [];
  const updatedUrls = [...currentUrls, fileUrl];

  const { error: updateError } = await supabase
    .from(table)
    .update({ file_urls: updatedUrls })
    .eq("id", submissionId);

  if (updateError) {
    logger.error("submission_file_attach_failed", updateError, {
      submissionId,
      table,
    });
    throw new BadRequestError("Failed to attach file to submission");
  }

  logger.info("file_attached_to_submission", {
    submissionId,
    table,
    totalFiles: updatedUrls.length,
  });

  return updatedUrls;
}
