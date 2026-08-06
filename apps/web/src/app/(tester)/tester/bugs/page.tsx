import type { Metadata } from "next";
import { serverFetch } from "@/lib/server-api";
import { BugListClient } from "./bug-list-client";

export const metadata: Metadata = {
  title: "Bugs | IIIT Kalyani LMS",
};

interface Bug {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  reporter_name: string;
  reporter_id: string;
  screenshot_urls: string[];
  created_at: string;
  updated_at: string;
}

export default async function BugsPage() {
  const bugs = await serverFetch<Bug[]>("/bugs");

  return <BugListClient bugs={bugs ?? []} />;
}
