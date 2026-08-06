import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import type {
  Assignment,
  AssignmentSubmission,
  Project,
  ProjectSubmission,
  QuizAttempt,
} from "@lms/shared";

const logger = new Logger("submission.service");

/**
 * Fetch an assignment by ID along with the user's existing submission.
 * @param assignmentId - UUID of the assignment
 * @param userId - UUID of the authenticated user
 * @returns The assignment and any existing submission
 * @throws {NotFoundError} When the assignment does not exist
 */
export async function getAssignment(
  assignmentId: string,
  userId: string
): Promise<{ assignment: Assignment; submission: AssignmentSubmission | null }> {
  const [assignmentResult, submissionResult] = await Promise.all([
    supabase.from("assignments").select("*").eq("id", assignmentId).single(),
    supabase
      .from("assignment_submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (assignmentResult.error || !assignmentResult.data) {
    throw new NotFoundError("Assignment");
  }

  logger.info("assignment_fetched", { assignmentId, userId });

  return {
    assignment: assignmentResult.data as Assignment,
    submission: (submissionResult.data as AssignmentSubmission) ?? null,
  };
}

/**
 * Submit code for an assignment.
 * @param userId - UUID of the authenticated user
 * @param assignmentId - UUID of the assignment
 * @param courseId - UUID of the course
 * @param code - Submitted code content
 * @param fileUrls - Optional array of uploaded file URLs
 * @returns The created submission record
 * @throws {BadRequestError} When the insert fails
 */
export async function submitAssignment(
  userId: string,
  assignmentId: string,
  courseId: string,
  code: string,
  fileUrls?: string[]
): Promise<AssignmentSubmission> {
  const { data, error } = await supabase
    .from("assignment_submissions")
    .insert({
      user_id: userId,
      assignment_id: assignmentId,
      course_id: courseId,
      code,
      file_urls: fileUrls ?? [],
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    logger.error("assignment_submit_failed", error, { userId, assignmentId });
    throw new BadRequestError(error.message);
  }

  logger.info("assignment_submitted", { userId, assignmentId, courseId });
  return data as AssignmentSubmission;
}

/**
 * Fetch a project by ID along with the user's existing submission.
 * @param projectId - UUID of the project
 * @param userId - UUID of the authenticated user
 * @returns The project and any existing submission
 * @throws {NotFoundError} When the project does not exist
 */
export async function getProject(
  projectId: string,
  userId: string
): Promise<{ project: Project; submission: ProjectSubmission | null }> {
  const [projectResult, submissionResult] = await Promise.all([
    supabase.from("projects").select("*").eq("id", projectId).single(),
    supabase
      .from("project_submissions")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (projectResult.error || !projectResult.data) {
    throw new NotFoundError("Project");
  }

  logger.info("project_fetched", { projectId, userId });

  return {
    project: projectResult.data as Project,
    submission: (submissionResult.data as ProjectSubmission) ?? null,
  };
}

/**
 * Submit code for a project.
 * @param userId - UUID of the authenticated user
 * @param projectId - UUID of the project
 * @param courseId - UUID of the course
 * @param code - Submitted code content
 * @param fileUrls - Optional array of uploaded file URLs
 * @returns The created submission record
 * @throws {BadRequestError} When the insert fails
 */
export async function submitProject(
  userId: string,
  projectId: string,
  courseId: string,
  code: string,
  fileUrls?: string[]
): Promise<ProjectSubmission> {
  const { data, error } = await supabase
    .from("project_submissions")
    .insert({
      user_id: userId,
      project_id: projectId,
      course_id: courseId,
      code,
      file_urls: fileUrls ?? [],
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    logger.error("project_submit_failed", error, { userId, projectId });
    throw new BadRequestError(error.message);
  }

  logger.info("project_submitted", { userId, projectId, courseId });
  return data as ProjectSubmission;
}

/**
 * Fetch all submissions and quiz attempts for a user.
 * @param userId - UUID of the authenticated user
 * @returns Assignment submissions, project submissions, and quiz attempts
 */
export async function getUserSubmissions(userId: string): Promise<{
  assignments: AssignmentSubmission[];
  projects: ProjectSubmission[];
  quizzes: QuizAttempt[];
}> {
  const [assignmentResult, projectResult, quizResult] = await Promise.all([
    supabase
      .from("assignment_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("project_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false }),
  ]);

  logger.info("user_submissions_fetched", { userId });

  return {
    assignments: (assignmentResult.data ?? []) as AssignmentSubmission[],
    projects: (projectResult.data ?? []) as ProjectSubmission[],
    quizzes: (quizResult.data ?? []) as QuizAttempt[],
  };
}

/**
 * Grade a submission and award XP to the student.
 * @param submissionId - UUID of the submission
 * @param table - Target table: assignment_submissions or project_submissions
 * @param grade - Numeric grade (0-100)
 * @param feedback - Grading feedback text
 * @returns The updated submission record
 * @throws {NotFoundError} When the submission does not exist
 * @throws {BadRequestError} When the update fails
 */
export async function gradeSubmission(
  submissionId: string,
  table: "assignment_submissions" | "project_submissions",
  grade: number,
  feedback: string
): Promise<AssignmentSubmission | ProjectSubmission> {
  const { data, error } = await supabase
    .from(table)
    .update({
      grade,
      feedback,
      status: "graded",
      graded_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select("*")
    .single();

  if (error || !data) {
    logger.error("grade_failed", error ?? new Error("No data"), {
      submissionId,
      table,
    });
    throw error ? new BadRequestError(error.message) : new NotFoundError("Submission");
  }

  const submission = data as AssignmentSubmission | ProjectSubmission;
  const sourceId =
    "assignment_id" in submission
      ? submission.assignment_id
      : (submission as ProjectSubmission).project_id;

  const sourceType = table === "assignment_submissions" ? "assignment" : "project";
  const refTable = sourceType === "assignment" ? "assignments" : "projects";

  const { data: sourceData } = await supabase
    .from(refTable)
    .select("xp_reward")
    .eq("id", sourceId)
    .single();

  if (sourceData?.xp_reward) {
    const xpAmount = Math.round(sourceData.xp_reward * (grade / 100));

    await Promise.all([
      supabase.from("xp_transactions").insert({
        user_id: submission.user_id,
        amount: xpAmount,
        source_type: sourceType,
        source_id: sourceId,
        description: `Graded ${sourceType}: ${grade}/100`,
      }),
      supabase.rpc("increment_xp", {
        p_user_id: submission.user_id,
        p_amount: xpAmount,
      }),
    ]);

    logger.info("xp_awarded", {
      userId: submission.user_id,
      xpAmount,
      sourceType,
      sourceId,
    });
  }

  logger.info("submission_graded", { submissionId, table, grade });
  return submission;
}
