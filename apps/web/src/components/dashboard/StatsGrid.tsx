"use client";

import { BookOpen, Zap, Flame, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";

interface StatsGridProps {
  lessonsDone: string;
  totalXp: string;
  dayStreak: string;
  rank: string;
}

const iconMap = [
  { key: "lessonsDone", label: "Lessons Done", icon: BookOpen, color: "#58CC02" },
  { key: "totalXp", label: "Total XP", icon: Zap, color: "#1899D6" },
  { key: "dayStreak", label: "Day Streak", icon: Flame, color: "#FF9600" },
  { key: "rank", label: "Rank", icon: TrendingUp, color: "#A560E8" },
] as const;

export function StatsGrid({ lessonsDone, totalXp, dayStreak, rank }: StatsGridProps) {
  const values: Record<string, string> = { lessonsDone, totalXp, dayStreak, rank };

  return (
    <FadeIn delay={0.1}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {iconMap.map((stat) => (
          <Card key={stat.key} size="sm">
            <CardContent className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl shrink-0"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon
                  className="h-4 w-4"
                  style={{ color: stat.color }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight">
                  {values[stat.key]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </FadeIn>
  );
}
