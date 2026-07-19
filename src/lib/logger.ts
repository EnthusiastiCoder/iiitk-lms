import { Logger, SimpleFetchTransport } from "@axiomhq/logging";
import { nextJsFormatters } from "@axiomhq/nextjs";

const token = process.env.AXIOM_TOKEN;
const dataset = process.env.AXIOM_DATASET || "backend";

const transport = new SimpleFetchTransport({
  input: `https://api.axiom.co/v1/datasets/${dataset}/ingest`,
  init: {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  },
  autoFlush: { durationMs: 1000 },
});

export const log = new Logger({
  transports: [transport],
  formatters: nextJsFormatters,
});

// Log levels
export function logInfo(event: string, data?: Record<string, any>) {
  log.info(event, data);
}

export function logError(
  event: string,
  error: Error | string,
  data?: Record<string, any>
) {
  log.error(event, {
    error: typeof error === "string" ? error : error.message,
    stack: error instanceof Error ? error.stack : undefined,
    ...data,
  });
}

export function logWarn(event: string, data?: Record<string, any>) {
  log.warn(event, data);
}

// User activity logging
export function logUserAction(
  userId: string,
  action: string,
  details?: Record<string, any>
) {
  log.info("user.action", { userId, action, ...details });
}
