"use client";

import { useEffect, useRef } from "react";
import { submissions } from "@/lib/api";
import { showToast } from "@/components/ui/toast-notification";

interface SubmissionEntry {
  id: string;
  status: string;
  grade?: number | null;
}

export function GradingNotifier({ userId }: { userId: string }) {
  const prevRef = useRef<Map<string, { status: string; grade?: number | null }> | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const data = await submissions.list();
        const current = new Map<string, { status: string; grade?: number | null }>();

        for (const sub of data.assignments as SubmissionEntry[]) {
          current.set(`assignment-${sub.id}`, { status: sub.status, grade: sub.grade });
        }
        for (const sub of data.projects as SubmissionEntry[]) {
          current.set(`project-${sub.id}`, { status: sub.status, grade: sub.grade });
        }

        if (prevRef.current) {
          for (const [key, entry] of current) {
            const prev = prevRef.current.get(key);
            if (entry.status === "graded" && prev && prev.status !== "graded") {
              const type = key.startsWith("assignment") ? "Assignment" : "Project";
              showToast(
                `${type} graded!`,
                entry.grade != null
                  ? `You scored ${entry.grade}/100. Check your submissions for feedback.`
                  : "Check your submissions for feedback."
              );
            }
          }
        }

        prevRef.current = current;
      } catch {
        // Silently ignore polling errors
      }
    }

    poll();
    const interval = setInterval(() => {
      if (active) poll();
    }, 30_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [userId]);

  return null;
}
