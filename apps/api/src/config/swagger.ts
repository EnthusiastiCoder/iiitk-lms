import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

/**
 * In dev (tsx watch), source TS files are available at ./src/.
 * In production (compiled JS), tsc outputs to ./dist/apps/api/src/
 * and preserves JSDoc comments, so swagger-jsdoc can read from there.
 */
const routeGlob =
  env.NODE_ENV === "production"
    ? "./dist/apps/api/src/routes/**/*.js"
    : "./src/routes/**/*.ts";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IIIT Kalyani LMS API",
      version: "1.0.0",
      description:
        "REST API for the gamified Learning Management System. " +
        "Handles auth, courses, lessons, quizzes, assignments, " +
        "projects, gamification, and admin operations.",
    },
    servers: [
      { url: "/api", description: "API base path" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [routeGlob],
};

export const swaggerSpec = swaggerJsdoc(options);
