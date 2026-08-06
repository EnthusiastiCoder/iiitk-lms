import type { Metadata } from "next";
import { serverFetch } from "@/lib/server-api";
import type { Achievement } from "@lms/shared";

export const metadata: Metadata = {
  title: "Achievements | IIIT Kalyani LMS",
};

import { Trophy, Lock, Star, Flame, Users, BookOpen, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FadeIn } from "@/components/motion/fade-in";

type AchievementWithStatus = Achievement & {
  progress: number;
  earned: boolean;
  earned_at: string | null;
};

const categoryConfig: Record<
  string,
  { icon: React.ElementType; label: string }
> = {
  learning: { icon: BookOpen, label: "Learning" },
  streak: { icon: Flame, label: "Streak" },
  social: { icon: Users, label: "Social" },
  mastery: { icon: Award, label: "Mastery" },
};

const rarityColors: Record<string, string> = {
  common: "var(--color-rarity-common)",
  rare: "var(--color-rarity-rare)",
  epic: "var(--color-rarity-epic)",
  legendary: "var(--color-rarity-legendary)",
};

function AchievementCard({
  achievement,
  earned,
}: {
  achievement: Achievement;
  earned: boolean;
}) {
  const rarity = achievement.rarity ?? "common";
  const color = rarityColors[rarity] ?? rarityColors.common;

  return (
    <Card
      className={
        earned
          ? undefined
          : "opacity-50 grayscale"
      }
    >
      <CardContent className="flex items-start gap-3 pt-1">
        <div
          className="shrink-0 mt-0.5 p-2 rounded-xl"
          style={{
            backgroundColor: earned ? `${color}15` : undefined,
            color: earned ? color : undefined,
          }}
        >
          {earned ? (
            <Star className="h-5 w-5" />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">
              {achievement.title ?? "Achievement"}
            </p>
            {earned && (
              <Badge
                variant="outline"
                className="shrink-0 text-[10px]"
                style={{
                  color,
                  borderColor: `${color}40`,
                }}
              >
                {rarity}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {achievement.description ?? "Complete the challenge to unlock."}
          </p>
          {achievement.xp_reward && earned && (
            <p className="text-xs text-brand font-medium mt-1">
              +{achievement.xp_reward} XP
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AchievementsPage() {
  const allAchievements =
    (await serverFetch<AchievementWithStatus[]>("/gamification/achievements")) ?? [];

  const earnedIds = new Set(
    allAchievements.filter((a) => a.earned).map((a) => a.id)
  );
  const earnedCount = earnedIds.size;
  const totalCount = allAchievements.length;

  const categories = ["all", "learning", "streak", "social", "mastery"];

  function filterByCategory(cat: string) {
    if (cat === "all") return allAchievements;
    return allAchievements.filter((a: Achievement) => a.category === cat);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand/10">
              <Trophy className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Achievements</h1>
              <p className="text-sm text-muted-foreground">
                Unlock achievements as you learn
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand">{earnedCount}</p>
            <p className="text-xs text-muted-foreground">
              of {totalCount} Earned
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Tabs defaultValue="all">
          <TabsList variant="line" className="mb-6">
            {categories.map((cat) => {
              const config = categoryConfig[cat];
              const Icon = config?.icon;
              return (
                <TabsTrigger key={cat} value={cat}>
                  <span className="flex items-center gap-1.5">
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {cat === "all" ? "All" : config?.label ?? cat}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((cat) => {
            const items = filterByCategory(cat);
            return (
              <TabsContent key={cat} value={cat}>
                {items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((achievement: Achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        earned={earnedIds.has(achievement.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <Trophy className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p>No achievements in this category yet.</p>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </FadeIn>
    </div>
  );
}
