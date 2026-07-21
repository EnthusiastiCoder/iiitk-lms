const FLUSH_INTERVAL_MS = 5000;
const FLUSH_COUNT_CAP = 50;

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  _time: string;
  level: LogLevel;
  module: string;
  event: string;
  environment: string;
  [key: string]: unknown;
}

class LogBuffer {
  private buffer: LogEntry[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly url: string;
  private readonly token: string;

  constructor(dataset: string, token: string) {
    this.url = `https://api.axiom.co/v1/datasets/${dataset}/ingest`;
    this.token = token;
  }

  enqueue(entry: LogEntry) {
    this.buffer.push(entry);
    if (this.buffer.length >= FLUSH_COUNT_CAP) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.flush();
      }, FLUSH_INTERVAL_MS);
    }
  }

  private async flush() {
    if (this.buffer.length === 0) return;
    const entries = this.buffer.splice(0, this.buffer.length);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    try {
      await fetch(this.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entries),
      });
    } catch {
      // Logging must never break the app
    }
  }
}

const token = process.env.AXIOM_TOKEN ?? "";
const dataset = process.env.AXIOM_DATASET ?? "backend";
const environment = process.env.NODE_ENV ?? "development";

const sharedBuffer = token ? new LogBuffer(dataset, token) : null;

function normalizeError(err: unknown): { message: string; stack?: string } {
  if (err instanceof Error) return { message: err.message, stack: err.stack };
  return { message: String(err) };
}

export class Logger {
  private readonly module: string;

  constructor(module: string) {
    this.module = module;
  }

  private log(level: LogLevel, event: string, data?: Record<string, unknown>) {
    sharedBuffer?.enqueue({
      _time: new Date().toISOString(),
      level,
      module: this.module,
      event: `${this.module}.${event}`,
      environment,
      ...data,
    });
  }

  info(event: string, data?: Record<string, unknown>) {
    this.log("info", event, data);
  }

  warn(event: string, data?: Record<string, unknown>) {
    this.log("warn", event, data);
  }

  error(err: unknown, data?: Record<string, unknown>) {
    const { message, stack } = normalizeError(err);
    this.log("error", "error", { error: message, stack, ...data });
  }

  debug(event: string, data?: Record<string, unknown>) {
    this.log("debug", event, data);
  }
}

/**
 * Safely fetch data with automatic error logging.
 * Returns the result on success, or the fallback/onError result on failure.
 *
 * Usage:
 *   const stats = await safeFetch(() => getClassStats(), log);
 *   const stats = await safeFetch(() => getClassStats(), log, () => defaultStats);
 *   const stats = await safeFetch(() => getClassStats(), log, (err) => { notify(err); return null; });
 */
export async function safeFetch<T>(
  fn: () => Promise<T>,
  logger: Logger,
  onError?: (err: unknown) => T | null,
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    logger.error(err);
    return onError ? onError(err) : null;
  }
}

