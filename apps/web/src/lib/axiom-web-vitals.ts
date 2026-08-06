"use client";

const token = process.env.NEXT_PUBLIC_AXIOM_TOKEN;
const dataset = process.env.NEXT_PUBLIC_AXIOM_DATASET || "frontend";

const FLUSH_INTERVAL_MS = 5000;
const FLUSH_COUNT_CAP = 50;

const buffer: Record<string, unknown>[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  if (buffer.length === 0 || !token) return;
  const events = buffer.splice(0, buffer.length);
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  try {
    await fetch(`https://api.axiom.co/v1/datasets/${dataset}/ingest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(events),
    });
  } catch {
    // Silently fail
  }
}

function scheduleFlush() {
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flush();
    }, FLUSH_INTERVAL_MS);
  }
}

function enqueue(event: Record<string, unknown>) {
  buffer.push({ _time: new Date().toISOString(), ...event });
  if (buffer.length >= FLUSH_COUNT_CAP) {
    flush();
  } else {
    scheduleFlush();
  }
}

export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  rating?: string;
  delta?: number;
  navigationType?: string;
}) {
  enqueue({
    level: "info",
    event: "web-vital",
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
  context?: Record<string, unknown>
) {
  enqueue({
    level: "error",
    event: "client.error",
    error: typeof error === "string" ? error : error.message,
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
}
