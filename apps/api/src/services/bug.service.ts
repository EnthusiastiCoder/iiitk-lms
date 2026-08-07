import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

const logger = new Logger("bug.service");

/** Filter options for listing bugs. */
interface BugFilters {
  status?: string;
  severity?: string;
}

/** Data required to create a new bug report. */
interface CreateBugData {
  title: string;
  description: string;
  severity: string;
  screenshots: string[];
  reporterId: string;
}

/** Data required to add a comment to a bug. */
interface AddCommentData {
  bugId: string;
  authorId?: string;
  authorName: string;
  message: string;
  isSystem?: boolean;
}

/**
 * List bugs with optional status and severity filters.
 * Joins reporter profile name and orders by created_at desc.
 * @param filters - Optional status and severity filters
 * @returns Array of bug records with reporter name
 */
export async function listBugs(filters?: BugFilters): Promise<Record<string, unknown>[]> {
  let query = supabase
    .from("bugs")
    .select("*, profiles!bugs_reporter_id_fkey(full_name)")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.severity) {
    query = query.eq("severity", filters.severity);
  }

  const { data, error } = await query;

  if (error) {
    logger.error("list_bugs_failed", error);
    throw new BadRequestError(error.message);
  }

  logger.info("bugs_listed", { count: data?.length ?? 0, filters });
  return data ?? [];
}

/**
 * Get a single bug by ID with all its comments.
 * @param bugId - UUID of the bug
 * @returns The bug record and its comments ordered by created_at asc
 * @throws {NotFoundError} When the bug does not exist
 */
export async function getBugById(bugId: string): Promise<Record<string, unknown>> {
  const [bugResult, commentsResult] = await Promise.all([
    supabase
      .from("bugs")
      .select("*, profiles!bugs_reporter_id_fkey(full_name)")
      .eq("id", bugId)
      .single(),
    supabase
      .from("bug_comments")
      .select("*")
      .eq("bug_id", bugId)
      .order("created_at", { ascending: true }),
  ]);

  if (bugResult.error || !bugResult.data) {
    throw new NotFoundError("Bug");
  }

  logger.info("bug_fetched", { bugId });

  return {
    ...bugResult.data,
    comments: commentsResult.data ?? [],
  };
}

/**
 * Create a new bug report.
 * @param data - Bug creation data including title, description, severity, screenshots, and reporterId
 * @returns The created bug record
 * @throws {BadRequestError} When the insert fails
 */
export async function createBug(data: CreateBugData): Promise<Record<string, unknown>> {
  const { data: bug, error } = await supabase
    .from("bugs")
    .insert({
      title: data.title,
      description: data.description,
      severity: data.severity,
      screenshots: data.screenshots,
      reporter_id: data.reporterId,
      status: "open",
    })
    .select("*")
    .single();

  if (error) {
    logger.error("create_bug_failed", error, { reporterId: data.reporterId });
    throw new BadRequestError(error.message);
  }

  logger.info("bug_created", { bugId: bug.id, reporterId: data.reporterId });
  return bug;
}

/**
 * Update the status of a bug.
 * @param bugId - UUID of the bug to update
 * @param status - New status value
 * @returns The updated bug record
 * @throws {NotFoundError} When the bug does not exist
 */
export async function updateBugStatus(bugId: string, status: string): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from("bugs")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bugId)
    .select("*")
    .single();

  if (error || !data) {
    if (error) {
      logger.error("update_bug_status_failed", error, { bugId, status });
    }
    throw new NotFoundError("Bug");
  }

  logger.info("bug_status_updated", { bugId, status });
  return data;
}

/**
 * Add a comment to a bug.
 * @param data - Comment data including bugId, authorName, message, and optional authorId and isSystem flag
 * @returns The created comment record
 * @throws {BadRequestError} When the insert fails
 */
export async function addComment(data: AddCommentData): Promise<Record<string, unknown>> {
  const { data: comment, error } = await supabase
    .from("bug_comments")
    .insert({
      bug_id: data.bugId,
      author_id: data.authorId ?? null,
      author_name: data.authorName,
      message: data.message,
      is_system: data.isSystem ?? false,
    })
    .select("*")
    .single();

  if (error) {
    logger.error("add_comment_failed", error, { bugId: data.bugId });
    throw new BadRequestError(error.message);
  }

  logger.info("comment_added", { bugId: data.bugId, isSystem: data.isSystem });
  return comment;
}

/**
 * Close a bug and add a system comment.
 * @param bugId - UUID of the bug to close
 * @param userId - UUID of the user closing the bug
 * @returns The updated bug record
 * @throws {NotFoundError} When the bug does not exist
 */
export async function closeBug(bugId: string, userId: string): Promise<Record<string, unknown>> {
  const bug = await updateBugStatus(bugId, "closed");

  await addComment({
    bugId,
    authorId: userId,
    authorName: "System",
    message: "Bug closed",
    isSystem: true,
  });

  logger.info("bug_closed", { bugId, userId });
  return bug;
}

/**
 * Reopen a bug and add a system comment.
 * @param bugId - UUID of the bug to reopen
 * @param userId - UUID of the user reopening the bug
 * @returns The updated bug record
 * @throws {NotFoundError} When the bug does not exist
 */
export async function reopenBug(bugId: string, userId: string): Promise<Record<string, unknown>> {
  const bug = await updateBugStatus(bugId, "open");

  await addComment({
    bugId,
    authorId: userId,
    authorName: "System",
    message: "Bug reopened",
    isSystem: true,
  });

  logger.info("bug_reopened", { bugId, userId });
  return bug;
}
