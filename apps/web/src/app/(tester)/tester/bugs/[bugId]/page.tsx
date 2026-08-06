import type { Metadata } from "next";
import { serverFetch } from "@/lib/server-api";
import { BugDetailClient } from "./bug-detail-client";

export const metadata: Metadata = {
  title: "Bug Detail | IIIT Kalyani LMS",
};

interface Comment {
  id: string;
  bug_id: string;
  user_id: string;
  user_name: string;
  message: string;
  is_system: boolean;
  created_at: string;
}

interface Bug {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  reporter_id: string;
  reporter_name: string;
  screenshot_urls: string[];
  created_at: string;
  updated_at: string;
  comments: Comment[];
}

export default async function BugDetailPage({
  params,
}: {
  params: Promise<{ bugId: string }>;
}) {
  const { bugId } = await params;
  const data = await serverFetch<Bug>(`/bugs/${bugId}`);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground">Bug not found.</p>
      </div>
    );
  }

  return <BugDetailClient bug={data} />;
}
