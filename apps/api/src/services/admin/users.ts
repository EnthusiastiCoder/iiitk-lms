import { supabase } from "../../db/supabase.js";
import { Logger } from "../../utils/logger.js";
import { NotFoundError, BadRequestError } from "../../utils/errors.js";
import { parsePagination, paginate } from "../../utils/pagination.js";
import type { PaginatedResponse, Profile } from "@lms/shared";

const logger = new Logger("admin.users");

interface UserListOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

/**
 * Get a paginated list of users with optional search and role filter.
 * @param options - Pagination, search, and role filter options
 * @returns Paginated list of user profiles
 * @throws Error if database query fails
 */
export async function getUserList(
  options: UserListOptions
): Promise<PaginatedResponse<Profile>> {
  const { page, limit, offset } = parsePagination(options);

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.search) {
    query = query.or(
      `full_name.ilike.%${options.search}%,email.ilike.%${options.search}%`
    );
  }

  if (options.role) {
    query = query.eq("role", options.role);
  }

  const { data, count, error } = await query;

  if (error) {
    logger.error("get_user_list_failed", error);
    throw error;
  }

  return paginate(data ?? [], count ?? 0, { page, limit, offset });
}

/**
 * Get a user by ID with their profile, stats, and enrollments.
 * @param userId - The user's ID
 * @returns User profile, stats, and enrollments
 * @throws {NotFoundError} If the user is not found
 */
export async function getUserById(userId: string): Promise<{
  profile: Record<string, unknown>;
  stats: Record<string, unknown> | null;
  enrollments: Record<string, unknown>[];
}> {
  const [profileRes, statsRes, enrollRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("user_stats").select("*").eq("user_id", userId).single(),
    supabase
      .from("enrollments")
      .select("*, courses(title, slug)")
      .eq("user_id", userId),
  ]);

  if (!profileRes.data) {
    throw new NotFoundError("User");
  }

  logger.info("user_fetched", { userId });

  return {
    profile: profileRes.data,
    stats: statsRes.data,
    enrollments: enrollRes.data ?? [],
  };
}

/**
 * Update a user's role.
 * @param userId - The user's ID
 * @param role - The new role
 * @returns The updated profile
 * @throws {NotFoundError} If the user is not found
 * @throws {BadRequestError} If the role is invalid
 */
export async function updateUserRole(
  userId: string,
  role: string
): Promise<Profile> {
  const validRoles = ["student", "professor", "admin"];
  if (!validRoles.includes(role)) {
    throw new BadRequestError(`Invalid role: ${role}`);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116" || !data) {
      throw new NotFoundError("User");
    }
    logger.error("update_user_role_failed", error, { userId });
    throw error;
  }

  logger.info("user_role_updated", { userId, role });
  return data as Profile;
}

/**
 * Delete a user from profiles (cascade).
 * @param userId - The user's ID
 * @returns void
 * @throws {NotFoundError} If the user is not found
 */
export async function deleteUser(userId: string): Promise<void> {
  const { error, count } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) {
    logger.error("delete_user_failed", error, { userId });
    throw error;
  }

  if (count === 0) {
    throw new NotFoundError("User");
  }

  logger.info("user_deleted", { userId });
}

/**
 * Get a list of users with the professor role.
 * @returns Array of professor profiles
 * @throws Error if database query fails
 */
export async function getProfessorList(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "professor")
    .order("full_name", { ascending: true });

  if (error) {
    logger.error("get_professor_list_failed", error);
    throw error;
  }

  return (data ?? []) as Profile[];
}
