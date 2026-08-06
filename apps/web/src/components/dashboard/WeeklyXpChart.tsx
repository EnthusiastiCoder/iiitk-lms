"use client";

import Link from "next/link";
import { Zap, Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";

interface WeeklyXpChartProps {
  weeklyXp: number[];
  weeklyTotal: number;
  weeklyMax: number;
  dayLabels: string[];
}

export function WeeklyXpChart({
  weeklyXp,
  weeklyTotal,
  weeklyMax,
  dayLabels,
}: WeeklyXpChartProps) {
  return (
    <FadeIn delay={0.2}>
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand" />
              Weekly XP
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {weeklyTotal} XP
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-1.5 h-32">
            {weeklyXp.map((xp: number, i: number) => {
              const height =
                weeklyMax > 0 ? (xp / weeklyMax) * 100 : 0;
              const isToday =
                new Date().getDay() === (i === 6 ? 0 : i + 1);

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {xp > 0 ? xp : ""}
                  </span>
                  <div className="w-full flex items-end justify-center h-20">
                    <div
                      className="w-full max-w-8 rounded-t-md transition-all"
                      style={{
                        height: `${Math.max(height, 4)}%`,
                        backgroundColor: isToday
                          ? "#58CC02"
                          : xp > 0
                            ? "rgba(88, 204, 2, 0.3)"
                            : "var(--color-muted)",
                      }}
                    />
                  </div>
                  <span
                    className={`text-[10px] ${
                      isToday
                        ? "text-brand font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {dayLabels[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link href="/student/achievements">
          <Card
            size="sm"
            className="hover:ring-brand/30 transition-all hover:scale-[1.02]"
          >
            <CardContent className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-streak" />
              <span className="text-sm font-medium">Achievements</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/student/leaderboard">
          <Card
            size="sm"
            className="hover:ring-brand/30 transition-all hover:scale-[1.02]"
          >
            <CardContent className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" />
              <span className="text-sm font-medium">Leaderboard</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </FadeIn>
  );
}
