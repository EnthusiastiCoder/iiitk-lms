"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/toast-notification";

export function GradingNotifier({ userId }: { userId: string }) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("grading-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "assignment_submissions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (
            payload.new.status === "graded" &&
            payload.old.status !== "graded"
          ) {
            const grade = payload.new.grade;
            showToast(
              "Assignment graded!",
              grade != null
                ? `You scored ${grade}/100. Check your submissions for feedback.`
                : "Check your submissions for feedback."
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "project_submissions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (
            payload.new.status === "graded" &&
            payload.old.status !== "graded"
          ) {
            const grade = payload.new.grade;
            showToast(
              "Project graded!",
              grade != null
                ? `You scored ${grade}/100. Check your submissions for feedback.`
                : "Check your submissions for feedback."
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return null;
}
