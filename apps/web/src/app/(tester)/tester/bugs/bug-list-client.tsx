"use client";

import { useState } from "react";
import Link from "next/link";
import { Bug, Plus, ImageIcon, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";

interface BugItem {
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

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

const SEVERITY_OPTIONS = ["all", "critical", "high", "medium", "low"];

const severityColors: Record<string, { bg: string; text: string }> = {
  critical: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" },
  high: { bg: "rgba(249, 115, 22, 0.15)", text: "#F97316" },
  medium: { bg: "rgba(234, 179, 8, 0.15)", text: "#EAB308" },
  low: { bg: "rgba(34, 197, 94, 0.15)", text: "#22C55E" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  open: { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6" },
  in_progress: { bg: "rgba(234, 179, 8, 0.15)", text: "#EAB308" },
  resolved: { bg: "rgba(34, 197, 94, 0.15)", text: "#22C55E" },
  closed: { bg: "rgba(107, 114, 128, 0.15)", text: "#6B7280" },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BugListClient({ bugs }: { bugs: BugItem[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filtered = bugs.filter((b) => {
    if (activeTab !== "all" && b.status !== activeTab) return false;
    if (severityFilter !== "all" && b.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <FadeIn>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bug className="h-6 w-6" style={{ color: "#F59E0B" }} />
              Bug Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {bugs.length} total bug{bugs.length !== 1 ? "s" : ""} reported
            </p>
          </div>
          <Link href="/tester/bugs/new">
            <Button
              style={{ backgroundColor: "#F59E0B", color: "#000" }}
              className="hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Report Bug
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Status tabs */}
          <div className="flex gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor:
                    activeTab === tab.key
                      ? "rgba(245, 158, 11, 0.15)"
                      : "transparent",
                  color: activeTab === tab.key ? "#F59E0B" : undefined,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Severity dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-3 text-sm outline-none"
            style={{ minWidth: 130 }}
          >
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </FadeIn>

      {/* Bug list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <FadeIn delay={0.1}>
            <Card>
              <CardContent className="py-12 text-center">
                <Bug className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground">
                  No bugs found matching your filters.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          filtered.map((bug, i) => {
            const sev = severityColors[bug.severity] ?? severityColors.low;
            const stat = statusColors[bug.status] ?? statusColors.open;
            const screenshots = bug.screenshot_urls ?? [];
            return (
              <FadeIn key={bug.id} delay={0.05 * Math.min(i, 10)}>
                <Link href={`/tester/bugs/${bug.id}`}>
                  <Card className="hover:ring-1 hover:ring-border transition-all cursor-pointer">
                    <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate mb-1">
                          {bug.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: sev.bg,
                              color: sev.text,
                              borderColor: "transparent",
                            }}
                          >
                            {bug.severity}
                          </Badge>
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: stat.bg,
                              color: stat.text,
                              borderColor: "transparent",
                            }}
                          >
                            {bug.status.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            by {bug.reporter_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        {screenshots.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {screenshots.length}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(bug.created_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </FadeIn>
            );
          })
        )}
      </div>
    </div>
  );
}
