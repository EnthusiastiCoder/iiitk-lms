import type { Profile, UserStats } from "./types";

export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: {
    message: string;
    code: string;
    status: number;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: "student" | "professor";
}

export interface LoginResponse {
  user: Profile;
  stats: UserStats;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: Profile;
  tokens: AuthTokens;
  confirmationRequired: boolean;
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GradeRequest {
  grade: number;
  feedback: string;
}

export interface SubmitCodeRequest {
  code: string;
  fileUrls?: string[];
}

export interface QuizAttemptRequest {
  answers: Record<string, string>;
  score: number;
  timeSpent: number;
}
