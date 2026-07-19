"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { enrollInCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleEnroll = () => {
    startTransition(async () => {
      await enrollInCourse(courseId);
      router.refresh();
    });
  };

  return (
    <Button
      size="lg"
      className="w-full bg-brand hover:bg-brand-dark text-white font-semibold text-base h-11"
      onClick={handleEnroll}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        "Enroll in Course"
      )}
    </Button>
  );
}
