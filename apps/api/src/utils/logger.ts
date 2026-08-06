import { env } from "../config/env.js";

interface LogEntry {
  level: "info" | "warn" | "error";
  module: string;
  event: string;
  data?: Record<string, unknown>;
  error?: { message: string; stack?: string };
  timestamp: string;
}

const BATCH_INTERVAL_MS = 5000;
const BATCH_SIZE_CAP = 50;

let buffer: LogEntry[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

async function flushToAxiom(): Promise<void> {
  if (buffer.length === 0 || !env.AXIOM_TOKEN) return;

  const batch = buffer.splice(0);

  try {
    await fetch(
      `https://api.axiom.co/v1/datasets/${env.AXIOM_DATASET}/ingest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.AXIOM_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch.map((e) => ({ _time: e.timestamp, ...e }))),
      }
    );
  } catch {
    console.error(`[logger] Axiom flush failed for ${batch.length} entries`);
  }
}

function enqueue(entry: LogEntry): void {
  buffer.push(entry);
  if (buffer.length >= BATCH_SIZE_CAP) {
    void flushToAxiom();
  }
}

function startFlushTimer(): void {
  if (flushTimer) return;
  flushTimer = setInterval(() => void flushToAxiom(), BATCH_INTERVAL_MS);
  flushTimer.unref();
}

startFlushTimer();

/**
 * Flush remaining logs on process exit.
 * @returns Resolves when the final Axiom flush completes
 */
export function shutdownLogger(): Promise<void> {
  if (flushTimer) clearInterval(flushTimer);
  return flushToAxiom();
}

/** Structured logger that batches entries and flushes to Axiom. */
export class Logger {
  /**
   * @param module - Module name used to tag all log entries from this instance
   */
  constructor(private module: string) {}

  /**
   * Log an informational event.
   * @param event - Short event identifier
   * @param data - Optional structured data to attach
   * @returns void
   */
  info(event: string, data?: Record<string, unknown>): void {
    enqueue({
      level: "info",
      module: this.module,
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log a warning.
   * @param event - Short event identifier
   * @param data - Optional structured data to attach
   * @returns void
   */
  warn(event: string, data?: Record<string, unknown>): void {
    enqueue({
      level: "warn",
      module: this.module,
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log an error with automatic normalization.
   * @param event - Short event identifier
   * @param err - The error value to normalize and attach
   * @param data - Optional structured data to attach
   * @returns void
   */
  error(event: string, err: unknown, data?: Record<string, unknown>): void {
    const normalized =
      err instanceof Error
        ? { message: err.message, stack: err.stack }
        : { message: String(err) };

    enqueue({
      level: "error",
      module: this.module,
      event,
      error: normalized,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}
