import jwt from "jsonwebtoken";
import { supabase } from "../db/supabase.js";
import { env } from "../config/env.js";
import { Logger } from "../utils/logger.js";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../utils/errors.js";
import type {
  Profile,
  UserStats,
  AuthTokens,
  LoginResponse,
  RegisterResponse,
} from "@lms/shared";
import type { AuthPayload } from "../middleware/auth.js";

const logger = new Logger("auth.service");

function signTokens(payload: AuthPayload): AuthTokens {
  const accessToken = jwt.sign(
    payload as unknown as Record<string, unknown>,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY as unknown as number }
  );
  const refreshToken = jwt.sign(
    payload as unknown as Record<string, unknown>,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY as unknown as number }
  );
  const decoded = jwt.decode(accessToken) as { exp: number };
  return { accessToken, refreshToken, expiresAt: decoded.exp };
}

/**
 * Register a new user via Supabase Admin API.
 * @param email - User's email address
 * @param password - User's password (min 8 chars)
 * @param fullName - User's display name
 * @param role - Account role to assign
 * @returns The created profile, auth tokens, and confirmation status
 * @throws {ConflictError} If the email is already registered
 * @throws {BadRequestError} If Supabase rejects the input
 */
export async function register(
  email: string,
  password: string,
  fullName: string,
  role: "student" | "professor"
): Promise<RegisterResponse> {
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

  if (authError) {
    logger.error("register_failed", authError, { email });
    if (authError.message.includes("already")) {
      throw new ConflictError("Email already registered");
    }
    throw new BadRequestError(authError.message);
  }

  const userId = authData.user.id;
  const username = email.split("@")[0];

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      full_name: fullName,
      username,
      email,
      role,
      avatar_url: "",
      institution: "IIIT Kalyani",
    });

  if (profileError) {
    logger.error("profile_create_failed", profileError, { userId });
  }

  const { error: statsError } = await supabase
    .from("user_stats")
    .insert({ user_id: userId });

  if (statsError) {
    logger.error("stats_create_failed", statsError, { userId });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const tokens = signTokens({ userId, role, email });

  logger.info("user_registered", { userId, role });

  return {
    user: profile as Profile,
    tokens,
    confirmationRequired: false,
  };
}

/**
 * Login with email and password.
 * @param email - User's email address
 * @param password - User's password
 * @returns The user profile, stats, and auth tokens
 * @throws {UnauthorizedError} If credentials are invalid or profile not found
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.warn("login_failed", { email, reason: error.message });
    throw new UnauthorizedError("Invalid email or password");
  }

  const userId = data.user.id;

  const [profileResult, statsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("user_stats").select("*").eq("user_id", userId).single(),
  ]);

  if (!profileResult.data) {
    throw new UnauthorizedError("Profile not found");
  }

  const profile = profileResult.data as Profile;
  const stats = statsResult.data as UserStats;
  const tokens = signTokens({
    userId,
    role: profile.role,
    email: profile.email,
  });

  logger.info("user_logged_in", { userId, role: profile.role });

  return { user: profile, stats, tokens };
}

/**
 * Refresh an access token using a refresh token.
 * @param refreshToken - The refresh JWT to verify and rotate
 * @returns A new pair of access and refresh tokens
 * @throws {UnauthorizedError} If the refresh token is invalid or expired
 */
export function refresh(refreshToken: string): AuthTokens {
  try {
    const payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET
    ) as AuthPayload;

    return signTokens({
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    });
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}
