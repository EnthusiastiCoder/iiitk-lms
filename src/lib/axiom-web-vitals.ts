"use client";

import { Logger, SimpleFetchTransport } from "@axiomhq/logging";
import { nextJsFormatters } from "@axiomhq/nextjs";

const token = process.env.NEXT_PUBLIC_AXIOM_TOKEN;
const dataset = process.env.NEXT_PUBLIC_AXIOM_DATASET || "frontend";

const transport = new SimpleFetchTransport({
  input: `https://api.axiom.co/v1/datasets/${dataset}/ingest`,
  init: {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  },
  autoFlush: { durationMs: 5000 },
});

const frontendLogger = new Logger({
  transports: [transport],
  formatters: nextJsFormatters,
});

export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  rating?: string;
  delta?: number;
  navigationType?: string;
}) {
  frontendLogger.info("web-vital", {
    metricId: metric.id,
    metricName: metric.name,
    metricValue: metric.value,
    metricRating: metric.rating,
    metricDelta: metric.delta,
    navigationType: metric.navigationType,
  });
}

export function logClientError(
  error: Error | string,
  context?: Record<string, any>
) {
  frontendLogger.error("client.error", {
    error: typeof error === "string" ? error : error.message,
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
}
