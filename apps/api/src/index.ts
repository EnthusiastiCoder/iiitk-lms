import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { corsOptions } from "./config/cors.js";
import { swaggerSpec } from "./config/swagger.js";
import { apiLimiter } from "./middleware/rate-limit.js";
import { requestLogger } from "./middleware/request-logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { shutdownLogger, Logger } from "./utils/logger.js";
import { authRouter } from "./routes/auth.js";
import { courseRouter } from "./routes/courses.js";
import { enrollmentRouter } from "./routes/enrollments.js";
import { lessonRouter } from "./routes/lessons.js";
import { quizRouter } from "./routes/quizzes.js";
import { assignmentRouter } from "./routes/assignments.js";
import { projectRouter } from "./routes/projects.js";
import { submissionRouter } from "./routes/submissions.js";
import { gamificationRouter } from "./routes/gamification.js";
import { profileRouter } from "./routes/profile.js";
import { uploadRouter } from "./routes/upload.js";
import { adminUserRouter } from "./routes/admin/users.js";
import { adminCourseRouter } from "./routes/admin/courses.js";
import { adminAchievementRouter } from "./routes/admin/achievements.js";
import { adminAnalyticsRouter } from "./routes/admin/analytics.js";
import { adminStatsRouter } from "./routes/admin/stats.js";
import { professorDashboardRouter } from "./routes/professor/dashboard.js";
import { professorStudentRouter } from "./routes/professor/students.js";
import { professorGradingRouter } from "./routes/professor/grading.js";
import { professorContentRouter } from "./routes/professor/content.js";
import { authenticate } from "./middleware/auth.js";
import { requireProfessor, requireAdmin } from "./middleware/roles.js";

const app = express();
const logger = new Logger("server");

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(apiLimiter);
app.use(requestLogger);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);

app.use("/api/courses", authenticate, courseRouter);
app.use("/api/enrollments", authenticate, enrollmentRouter);
app.use("/api/lessons", authenticate, lessonRouter);
app.use("/api/quizzes", authenticate, quizRouter);
app.use("/api/assignments", authenticate, assignmentRouter);
app.use("/api/projects", authenticate, projectRouter);
app.use("/api/submissions", authenticate, submissionRouter);
app.use("/api/gamification", authenticate, gamificationRouter);
app.use("/api/profile", authenticate, profileRouter);
app.use("/api/upload", authenticate, uploadRouter);

app.use("/api/admin", authenticate, requireAdmin, adminUserRouter);
app.use("/api/admin", authenticate, requireAdmin, adminCourseRouter);
app.use("/api/admin", authenticate, requireAdmin, adminAchievementRouter);
app.use("/api/admin", authenticate, requireAdmin, adminAnalyticsRouter);
app.use("/api/admin", authenticate, requireAdmin, adminStatsRouter);

app.use("/api/professor", authenticate, requireProfessor, professorDashboardRouter);
app.use("/api/professor", authenticate, requireProfessor, professorStudentRouter);
app.use("/api/professor", authenticate, requireProfessor, professorGradingRouter);
app.use("/api/professor", authenticate, requireProfessor, professorContentRouter);

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info("server_start", { port: env.PORT, env: env.NODE_ENV });
  console.warn(`API running on http://localhost:${env.PORT}`);
  console.warn(`Swagger docs at http://localhost:${env.PORT}/api-docs`);
});

async function shutdown(): Promise<void> {
  logger.info("server_shutdown", {});
  await shutdownLogger();
  server.close();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());
