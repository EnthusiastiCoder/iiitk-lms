"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";

export interface SkillNode {
  id: string;
  course_id: string;
  label: string;
  description: string | null;
  x: number;
  y: number;
  prerequisite_ids: string[] | null;
  lesson_ids: string[] | null;
  icon: string | null;
}

export interface SkillEdge {
  id: string;
  course_id: string;
  from_node_id: string;
  to_node_id: string;
}

type NodeStatus = "completed" | "available" | "locked";

interface SkillTreeViewProps {
  nodes: SkillNode[];
  edges: SkillEdge[];
  completedLessonIds: Set<string>;
  courseColor: string;
}

function textColorForBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1a1a1a" : "#ffffff";
}

function getNodeStatus(
  node: SkillNode,
  completedLessonIds: Set<string>,
  nodeStatusMap: Map<string, NodeStatus>
): NodeStatus {
  const lessons = node.lesson_ids ?? [];
  const allLessonsDone =
    lessons.length > 0 && lessons.every((id) => completedLessonIds.has(id));

  if (allLessonsDone) return "completed";

  const prereqs = node.prerequisite_ids ?? [];
  if (prereqs.length === 0) return "available";

  const allPrereqsCompleted = prereqs.every(
    (pid) => nodeStatusMap.get(pid) === "completed"
  );

  return allPrereqsCompleted ? "available" : "locked";
}

function computeStatuses(
  nodes: SkillNode[],
  completedLessonIds: Set<string>
): Map<string, NodeStatus> {
  const statusMap = new Map<string, NodeStatus>();

  // Topological-ish pass: iterate until stable
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 20) {
    changed = false;
    iterations++;
    for (const node of nodes) {
      const status = getNodeStatus(node, completedLessonIds, statusMap);
      if (statusMap.get(node.id) !== status) {
        statusMap.set(node.id, status);
        changed = true;
      }
    }
  }

  return statusMap;
}

function NodeCard({
  node,
  status,
  courseColor,
  isSelected,
  posX,
  posY,
  onHover,
  onLeave,
  onClick,
}: {
  node: SkillNode;
  status: NodeStatus;
  courseColor: string;
  isSelected: boolean;
  posX: number;
  posY: number;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const isCompleted = status === "completed";
  const isAvailable = status === "available";
  const isLocked = status === "locked";
  const lessonCount = node.lesson_ids?.length ?? 0;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={{ left: posX, top: posY }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative rounded-xl px-4 py-2.5 min-w-[110px] max-w-[160px] text-center transition-all duration-200",
          "border-2 shadow-sm",
          isCompleted && "border-transparent",
          isAvailable && "bg-card border-current text-foreground",
          isLocked &&
            "bg-muted/50 border-dashed border-muted-foreground/25 text-muted-foreground/50",
          isSelected &&
            !isLocked &&
            "ring-2 ring-offset-2 ring-offset-background scale-105",
          !isLocked && "hover:scale-105 hover:shadow-md"
        )}
        style={{
          ...(isCompleted
            ? {
                backgroundColor: courseColor,
                borderColor: courseColor,
                color: textColorForBg(courseColor),
              }
            : {}),
          ...(isAvailable
            ? { color: courseColor, borderColor: courseColor }
            : {}),
          ...(isSelected && !isLocked ? { ringColor: courseColor } : {}),
        }}
      >
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          {isCompleted && (
            <Check
              className="h-4 w-4 shrink-0"
              style={{ color: textColorForBg(courseColor) }}
            />
          )}
          {isLocked && <Lock className="h-3.5 w-3.5 shrink-0" />}
          <span className="text-sm font-bold leading-tight truncate">
            {node.label}
          </span>
        </div>
        <p
          className={cn(
            "text-xs leading-tight line-clamp-1",
            isLocked
              ? "text-muted-foreground/40"
              : !isCompleted
                ? "text-muted-foreground"
                : ""
          )}
          style={
            isCompleted
              ? { color: textColorForBg(courseColor), opacity: 0.7 }
              : undefined
          }
        >
          {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
        </p>

        {isAvailable && (
          <div
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full animate-pulse"
            style={{ backgroundColor: courseColor }}
          />
        )}
      </div>
    </div>
  );
}

export function SkillTreeView({
  nodes,
  edges,
  completedLessonIds,
  courseColor,
}: SkillTreeViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const statusMap = computeStatuses(nodes, completedLessonIds);

  const pad = 80;
  const minX = Math.min(...nodes.map((n) => n.x));
  const sx = (x: number) => x - minX + pad;
  const sy = (y: number) => y + 30;

  const maxX = Math.max(...nodes.map((n) => sx(n.x))) + pad;
  const maxY = Math.max(...nodes.map((n) => sy(n.y))) + 60;

  const hoveredNode = nodes.find((n) => n.id === hoveredId);
  const selectedNode = nodes.find((n) => n.id === selectedId);
  const detailNode = selectedNode ?? hoveredNode;

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
        No skill tree data for this course yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Tree */}
      <div
        className="relative overflow-auto flex-1 rounded-xl border border-border bg-card/50"
        style={{ minHeight: maxY + 40 }}
      >
        <div style={{ width: maxX, minHeight: maxY + 40, position: "relative" }}>
          <svg
            className="absolute inset-0 pointer-events-none"
            width={maxX}
            height={maxY + 40}
            viewBox={`0 0 ${maxX} ${maxY + 40}`}
          >
            {edges.map((edge) => {
              const from = nodes.find((n) => n.id === edge.from_node_id);
              const to = nodes.find((n) => n.id === edge.to_node_id);
              if (!from || !to) return null;

              const fromStatus = statusMap.get(from.id);
              const toStatus = statusMap.get(to.id);
              const bothDone =
                fromStatus === "completed" && toStatus === "completed";

              return (
                <line
                  key={edge.id}
                  x1={sx(from.x)}
                  y1={sy(from.y)}
                  x2={sx(to.x)}
                  y2={sy(to.y)}
                  stroke={
                    bothDone
                      ? courseColor
                      : "hsl(var(--muted-foreground) / 0.15)"
                  }
                  strokeWidth={2}
                  strokeDasharray={bothDone ? "none" : "6 4"}
                />
              );
            })}
          </svg>

          <div style={{ width: maxX, height: maxY + 40, position: "relative" }}>
            {nodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                status={statusMap.get(node.id) ?? "locked"}
                courseColor={courseColor}
                isSelected={selectedId === node.id}
                posX={sx(node.x)}
                posY={sy(node.y)}
                onHover={() => setHoveredId(node.id)}
                onLeave={() => setHoveredId(null)}
                onClick={() =>
                  setSelectedId((prev) =>
                    prev === node.id ? null : node.id
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {detailNode && (
        <div className="lg:w-64 shrink-0 rounded-xl border border-border bg-card p-4 self-start">
          <h3 className="font-bold text-sm mb-1">{detailNode.label}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {detailNode.description}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium capitalize",
                statusMap.get(detailNode.id) === "completed" &&
                  "text-white",
                statusMap.get(detailNode.id) === "available" &&
                  "border",
                statusMap.get(detailNode.id) === "locked" &&
                  "bg-muted text-muted-foreground"
              )}
              style={{
                ...(statusMap.get(detailNode.id) === "completed"
                  ? { backgroundColor: courseColor }
                  : {}),
                ...(statusMap.get(detailNode.id) === "available"
                  ? { color: courseColor, borderColor: courseColor }
                  : {}),
              }}
            >
              {statusMap.get(detailNode.id)}
            </span>
            <span className="text-muted-foreground">
              {detailNode.lesson_ids?.length ?? 0} lesson
              {(detailNode.lesson_ids?.length ?? 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
