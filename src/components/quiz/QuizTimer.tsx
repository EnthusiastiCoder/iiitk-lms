"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  timeRemaining: number;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function QuizTimer({ timeRemaining }: QuizTimerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-lg font-mono font-bold px-4 py-2 rounded-lg bg-card ring-1 ring-foreground/10",
        timeRemaining < 120 && "text-red-500"
      )}
    >
      <Clock className="h-5 w-5" />
      {formatTime(timeRemaining)}
    </div>
  );
}
