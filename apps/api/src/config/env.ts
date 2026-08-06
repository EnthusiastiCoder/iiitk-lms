import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(10000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default("1h"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  CLOUDINARY_CLOUD_NAME: z.string().default("placeholder"),
  CLOUDINARY_API_KEY: z.string().default("placeholder"),
  CLOUDINARY_API_SECRET: z.string().default("placeholder"),

  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().default("backend"),

  SENTRY_DSN: z.string().optional(),

  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  MCP_API_KEY: z.string().default("dev-mcp-key-change-in-production"),
});

/** Validated environment variables. Throws on startup if invalid. */
export const env = envSchema.parse(process.env);
