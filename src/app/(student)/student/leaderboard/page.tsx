import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/actions/gamification";

export const metadata: Metadata = {
  title: "Leaderboard | IIIT Kalyani LMS",
};
import { Medal, Trophy, Flame, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";

const tierConfig: Record<string, { color: string; label: string }> = {
  bronze: { color: "var(--color-tier-bronze)", label: "Bronze" },
  silver: { color: "var(--color-tier-silver)", label: "Silver" },
  gold: { color: "var(--color-tier-gold)", label: "Gold" },
  diamond: { color: "var(--color-tier-diamond)", label: "Diamond" },
};

const podiumColors = ["#E8A800", "#8E8E93", "#B87333"] as const;
const podiumLabels = ["1st", "2nd", "3rd"] as const;

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const leaderboard = await getLeaderboard();

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <FadeIn>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-brand/10">
            <Medal className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">
              Top learners ranked by XP
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {top3.map((entry, i) => {
              const isCurrentUser = entry.userId === user?.id;
              const tier = tierConfig[entry.tier] ?? tierConfig.bronze;

              return (
                <Card
                  key={entry.userId}
                  className={
                    isCurrentUser
                      ? "ring-2 ring-brand/40 bg-brand/5"
                      : undefined
                  }
                >
                  <CardContent className="flex flex-col items-center text-center pt-2">
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3 px-2 py-0.5 rounded-full"
                      style={{
                        color: podiumColors[i],
                        backgroundColor: `${podiumColors[i]}15`,
                      }}
                    >
                      {podiumLabels[i]}
                    </div>

                    <Avatar className="h-14 w-14 mb-3">
                      {entry.avatarUrl && (
                        <AvatarImage src={entry.avatarUrl} />
                      )}
                      <AvatarFallback className="bg-brand/20 text-brand text-lg font-bold">
                        {entry.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <p className="font-semibold text-sm truncate max-w-full">
                      {entry.name}
                      {isCurrentUser && (
                        <span className="text-brand ml-1">(You)</span>
                      )}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      <span>Lv. {entry.level}</span>
                      <span
                        className="font-medium"
                        style={{ color: tier.color }}
                      >
                        {tier.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-brand" />
                        <span className="text-sm font-bold">
                          {entry.xp.toLocaleString()} XP
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-streak">
                        <Flame className="h-3.5 w-3.5 animate-streak" />
                        <span className="text-sm font-bold">
                          {entry.streak}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </FadeIn>
      )}

      {/* Rankings Table */}
      <FadeIn delay={0.2}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-4 font-medium">Rank</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">
                      Level
                    </th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">
                      Tier
                    </th>
                    <th className="text-right py-3 px-4 font-medium">XP</th>
                    <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">
                      Streak
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(rest.length > 0 ? rest : leaderboard).map((entry) => {
                    const isCurrentUser = entry.userId === user?.id;
                    const tier = tierConfig[entry.tier] ?? tierConfig.bronze;

                    return (
                      <tr
                        key={entry.userId}
                        className={
                          isCurrentUser
                            ? "bg-brand/5 font-medium"
                            : "hover:bg-muted/50"
                        }
                      >
                        <td className="py-3 px-4">
                          <span
                            className={
                              entry.rank <= 3 ? "font-bold" : undefined
                            }
                            style={
                              entry.rank <= 3
                                ? { color: podiumColors[entry.rank - 1] }
                                : undefined
                            }
                          >
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {entry.avatarUrl && (
                                <AvatarImage src={entry.avatarUrl} />
                              )}
                              <AvatarFallback className="bg-brand/20 text-brand text-xs font-bold">
                                {entry.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate">
                                {entry.name}
                                {isCurrentUser && (
                                  <span className="text-brand ml-1 text-xs">
                                    (You)
                                  </span>
                                )}
                              </p>
                              {entry.username && (
                                <p className="text-xs text-muted-foreground truncate">
                                  @{entry.username}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          Lv. {entry.level}
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <Badge
                            variant="outline"
                            style={{
                              color: tier.color,
                              borderColor: `${tier.color}40`,
                            }}
                          >
                            {tier.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold">
                            {entry.xp.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right hidden sm:table-cell">
                          <div className="flex items-center justify-end gap-1 text-streak">
                            <Flame className="h-3 w-3" />
                            <span>{entry.streak}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {leaderboard.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Trophy className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No rankings yet. Start learning to climb the board!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
