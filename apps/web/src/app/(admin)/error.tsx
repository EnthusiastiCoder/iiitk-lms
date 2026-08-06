"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-error" />
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset} style={{ backgroundColor: "#FF4B4B" }} className="text-white">
          Try Again
        </Button>
      </div>
    </div>
  );
}
