import type {
  ApiResult,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthTokens,
  PaginatedResponse,
  Course,
  CourseWithModules,
  Lesson,
  Enrollment,
  LessonCompletion,
  Quiz,
  QuizQuestion,
  Achievement,
  StreakLog,
  Profile,
  UserStats,
} from "@lms/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:10000";

function getTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("lms_tokens");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("lms_tokens", JSON.stringify(tokens));
  document.cookie = `lms_access_token=${tokens.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("lms_tokens");
  document.cookie = "lms_access_token=; path=/; max-age=0";
}

export function getAccessToken(): string | null {
  return getTokens()?.accessToken ?? null;
}

async function refreshIfNeeded(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens) return null;

  const now = Math.floor(Date.now() / 1000);
  if (tokens.expiresAt > now + 60) return tokens.accessToken;

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const { data } = await res.json();
  setTokens(data as AuthTokens);
  return (data as AuthTokens).accessToken;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await refreshIfNeeded();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message ?? `API error ${res.status}`;
    throw new Error(msg);
  }

  const body = await res.json();
  return body.data as T;
}

export function serverFetch<T>(
  path: string,
  accessToken: string
): Promise<T> {
  return apiFetchWithToken<T>(path, accessToken);
}

async function apiFetchWithToken<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...((options.headers as Record<string, string>) ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `API error ${res.status}`);
  }

  const body = await res.json();
  return body.data as T;
}

export const auth = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  logout: (): Promise<void> =>
    apiFetch("/auth/logout", { method: "POST" }),
};

export const courses = {
  list: (): Promise<Course[]> => apiFetch("/courses"),
  getBySlug: (slug: string): Promise<Course> =>
    apiFetch(`/courses/${slug}`),
  getFull: (slug: string): Promise<CourseWithModules> =>
    apiFetch(`/courses/${slug}/full`),
};

export const enrollments = {
  list: (): Promise<Enrollment[]> => apiFetch("/enrollments"),
  completions: (courseId?: string): Promise<LessonCompletion[]> =>
    apiFetch(`/enrollments/completions${courseId ? `?courseId=${courseId}` : ""}`),
  enroll: (courseId: string): Promise<Enrollment> =>
    apiFetch("/enrollments", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    }),
};

export const lessons = {
  get: (id: string): Promise<Lesson> => apiFetch(`/lessons/${id}`),
  flashcards: (id: string): Promise<unknown> =>
    apiFetch(`/lessons/${id}/flashcards`),
  complete: (id: string, courseId: string): Promise<{ xpEarned: number; alreadyCompleted: boolean }> =>
    apiFetch(`/lessons/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({ courseId }),
    }),
};

export const quizzes = {
  get: (id: string): Promise<{ quiz: Quiz; questions: QuizQuestion[] }> =>
    apiFetch(`/quizzes/${id}`),
  attempt: (
    id: string,
    answers: Record<string, string>,
    score: number,
    timeSpent: number
  ): Promise<{ xpEarned: number }> =>
    apiFetch(`/quizzes/${id}/attempt`, {
      method: "POST",
      body: JSON.stringify({ answers, score, timeSpent }),
    }),
};

export const assignments = {
  get: (id: string): Promise<{ assignment: unknown; submission: unknown }> =>
    apiFetch(`/assignments/${id}`),
  submit: (
    id: string,
    courseId: string,
    code: string,
    fileUrls?: string[]
  ): Promise<unknown> =>
    apiFetch(`/assignments/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ courseId, code, fileUrls }),
    }),
};

export const projects = {
  get: (id: string): Promise<{ project: unknown; submission: unknown }> =>
    apiFetch(`/projects/${id}`),
  submit: (
    id: string,
    courseId: string,
    code: string,
    fileUrls?: string[]
  ): Promise<unknown> =>
    apiFetch(`/projects/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ courseId, code, fileUrls }),
    }),
};

export const submissions = {
  list: (): Promise<{
    assignments: unknown[];
    projects: unknown[];
    quizzes: unknown[];
  }> => apiFetch("/submissions"),
  grade: (
    id: string,
    table: string,
    grade: number,
    feedback: string
  ): Promise<unknown> =>
    apiFetch(`/submissions/${id}/grade`, {
      method: "POST",
      body: JSON.stringify({ table, grade, feedback }),
    }),
};

export const gamification = {
  leaderboard: (): Promise<{ profile: Profile; stats: UserStats }[]> =>
    apiFetch("/gamification/leaderboard"),
  achievements: (): Promise<
    (Achievement & { progress: number; earned: boolean; earned_at: string | null })[]
  > => apiFetch("/gamification/achievements"),
  streaks: (): Promise<StreakLog[]> => apiFetch("/gamification/streaks"),
  weeklyXp: (): Promise<{ date: string; xp: number }[]> =>
    apiFetch("/gamification/weekly-xp"),
};

export const profile = {
  get: (): Promise<{
    profile: Profile;
    stats: UserStats;
    streaks: StreakLog[];
    enrollments: Enrollment[];
    completionCount: number;
  }> => apiFetch("/profile"),
  update: (fullName: string): Promise<Profile> =>
    apiFetch("/profile", {
      method: "PATCH",
      body: JSON.stringify({ full_name: fullName }),
    }),
};

export const upload = {
  file: async (file: File): Promise<{ url: string; publicId: string }> => {
    const token = await refreshIfNeeded();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const body = await res.json();
    return body.data;
  },
  attach: (
    submissionId: string,
    table: string,
    fileUrl: string
  ): Promise<unknown> =>
    apiFetch("/upload/attach", {
      method: "POST",
      body: JSON.stringify({ submissionId, table, fileUrl }),
    }),
};

export const professor = {
  stats: (): Promise<unknown[]> => apiFetch("/professor/stats"),
  students: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<unknown>> => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.search) q.set("search", params.search);
    return apiFetch(`/professor/students?${q.toString()}`);
  },
  studentDetail: (id: string): Promise<unknown> =>
    apiFetch(`/professor/students/${id}`),
  pending: (): Promise<unknown> => apiFetch("/professor/pending"),
  graded: (): Promise<unknown> => apiFetch("/professor/graded"),
  courseContent: (slug: string): Promise<CourseWithModules> =>
    apiFetch(`/professor/courses/${slug}/content`),
  createModule: (
    courseId: string,
    data: Record<string, unknown>
  ): Promise<unknown> =>
    apiFetch("/professor/modules", {
      method: "POST",
      body: JSON.stringify({ courseId, ...data }),
    }),
  updateModule: (
    id: string,
    data: Record<string, unknown>
  ): Promise<unknown> =>
    apiFetch(`/professor/modules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteModule: (id: string): Promise<void> =>
    apiFetch(`/professor/modules/${id}`, { method: "DELETE" }),
  createLesson: (
    moduleId: string,
    courseId: string,
    data: Record<string, unknown>
  ): Promise<unknown> =>
    apiFetch("/professor/lessons", {
      method: "POST",
      body: JSON.stringify({ moduleId, courseId, ...data }),
    }),
  updateLesson: (
    id: string,
    data: Record<string, unknown>
  ): Promise<unknown> =>
    apiFetch(`/professor/lessons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteLesson: (id: string): Promise<void> =>
    apiFetch(`/professor/lessons/${id}`, { method: "DELETE" }),
  createAssignment: (
    moduleId: string,
    courseId: string,
    data: Record<string, unknown>
  ): Promise<unknown> =>
    apiFetch("/professor/assignments", {
      method: "POST",
      body: JSON.stringify({ moduleId, courseId, ...data }),
    }),
  updateAssignment: (
    id: string,
    data: Record<string, unknown>
  ): Promise<unknown> =>
    apiFetch(`/professor/assignments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteAssignment: (id: string): Promise<void> =>
    apiFetch(`/professor/assignments/${id}`, { method: "DELETE" }),
  createProject: (
    moduleId: string,
    courseId: string,
    data: Record<string, unknown>
  ): Promise<unknown> =>
    apiFetch("/professor/projects", {
      method: "POST",
      body: JSON.stringify({ moduleId, courseId, ...data }),
    }),
  updateProject: (
    id: string,
    data: Record<string, unknown>
  ): Promise<unknown> =>
    apiFetch(`/professor/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string): Promise<void> =>
    apiFetch(`/professor/projects/${id}`, { method: "DELETE" }),
  createQuiz: (
    moduleId: string,
    courseId: string,
    data: Record<string, unknown>
  ): Promise<{ id: string }> =>
    apiFetch("/professor/quizzes", {
      method: "POST",
      body: JSON.stringify({ moduleId, courseId, ...data }),
    }),
  updateQuiz: (
    id: string,
    data: Record<string, unknown>
  ): Promise<unknown> =>
    apiFetch(`/professor/quizzes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteQuiz: (id: string): Promise<void> =>
    apiFetch(`/professor/quizzes/${id}`, { method: "DELETE" }),
  createQuizQuestion: (
    quizId: string,
    data: Record<string, unknown>
  ): Promise<unknown> =>
    apiFetch(`/professor/quizzes/${quizId}/questions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const bugs = {
  list: (params?: {
    status?: string;
    severity?: string;
  }): Promise<unknown[]> => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.severity) q.set("severity", params.severity);
    const qs = q.toString();
    return apiFetch(`/bugs${qs ? `?${qs}` : ""}`);
  },
  get: (id: string): Promise<unknown> => apiFetch(`/bugs/${id}`),
  create: (data: {
    title: string;
    description: string;
    severity: string;
    screenshotUrls?: string[];
  }): Promise<unknown> =>
    apiFetch("/bugs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: (id: string, status: string): Promise<unknown> =>
    apiFetch(`/bugs/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  comment: (id: string, message: string): Promise<unknown> =>
    apiFetch(`/bugs/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  close: (id: string): Promise<unknown> =>
    apiFetch(`/bugs/${id}/close`, { method: "POST" }),
  reopen: (id: string): Promise<unknown> =>
    apiFetch(`/bugs/${id}/reopen`, { method: "POST" }),
};

export const admin = {
  stats: (): Promise<unknown> => apiFetch("/admin/stats"),
  users: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<unknown>> => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.search) q.set("search", params.search);
    if (params?.role) q.set("role", params.role);
    return apiFetch(`/admin/users?${q.toString()}`);
  },
  userDetail: (id: string): Promise<unknown> =>
    apiFetch(`/admin/users/${id}`),
  updateRole: (id: string, role: string): Promise<unknown> =>
    apiFetch(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  deleteUser: (id: string): Promise<void> =>
    apiFetch(`/admin/users/${id}`, { method: "DELETE" }),
  courses: (): Promise<unknown[]> => apiFetch("/admin/courses"),
  createCourse: (data: Record<string, unknown>): Promise<unknown> =>
    apiFetch("/admin/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteCourse: (id: string): Promise<void> =>
    apiFetch(`/admin/courses/${id}`, { method: "DELETE" }),
  assignInstructor: (
    courseId: string,
    professorId: string
  ): Promise<unknown> =>
    apiFetch(`/admin/courses/${courseId}/instructor`, {
      method: "PATCH",
      body: JSON.stringify({ professorId }),
    }),
  achievements: (): Promise<Achievement[]> =>
    apiFetch("/admin/achievements"),
  createAchievement: (data: Record<string, unknown>): Promise<unknown> =>
    apiFetch("/admin/achievements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  auditLog: (): Promise<unknown[]> => apiFetch("/admin/audit-log"),
  professors: (): Promise<unknown[]> => apiFetch("/admin/professors"),
  analytics: (): Promise<unknown> => apiFetch("/admin/analytics"),
};
