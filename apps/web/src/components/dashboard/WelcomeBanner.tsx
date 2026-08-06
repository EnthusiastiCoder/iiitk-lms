"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";

interface WelcomeBannerProps {
  greeting: string;
  firstName: string;
  tier: { label: string; color: string };
  level: number;
  currentStreak: number;
  totalXp: number;
  xpToNext: number;
  xpPercent: number;
}

export function WelcomeBanner({
  greeting,
  firstName,
  tier,
  level,
  currentStreak,
  totalXp,
  xpToNext,
  xpPercent,
}: WelcomeBannerProps) {
  return (
    <FadeIn>
      <Card className="mb-6 overflow-hidden">
        <CardContent className="relative pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{greeting},</p>
              <h1 className="text-2xl font-bold mt-0.5">{firstName}!</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  style={{
                    color: tier.color,
                    borderColor: `${tier.color}40`,
                  }}
                >
                  {tier.label}
                </Badge>
                <Badge variant="secondary">Level {level}</Badge>
                {currentStreak > 0 && (
                  <span className="flex items-center gap-1 text-streak text-sm font-bold">
                    <Flame className="h-4 w-4 animate-streak" />
                    {currentStreak}
                  </span>
                )}
              </div>
            </div>
            <div className="sm:text-right">
              <div className="flex items-center gap-2 sm:justify-end mb-1">
                <span className="text-xs text-muted-foreground">
                  Level {level}
                </span>
                <span className="text-xs text-muted-foreground">
                  {totalXp}/{xpToNext} XP
                </span>
              </div>
              <div className="w-full sm:w-48">
                <Progress value={xpPercent} className="h-2.5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
