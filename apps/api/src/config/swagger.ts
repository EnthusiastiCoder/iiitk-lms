import swaggerJsdoc from "swagger-jsdoc";

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
  apis: ["./src/routes/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
