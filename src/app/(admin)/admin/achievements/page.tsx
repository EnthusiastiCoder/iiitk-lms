import { getAllAchievements } from "@/actions/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap } from "lucide-react";
import { CreateAchievementDialog } from "@/components/admin/CreateAchievementDialog";

export default async function AdminAchievementsPage() {
  let achievements: any[] = [];

  try {
    achievements = await getAllAchievements();
  } catch {
    // No data
  }

  const rarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case "legendary":
        return { bg: "rgba(255, 165, 0, 0.15)", color: "#FF8C00" };
      case "epic":
        return { bg: "rgba(148, 103, 189, 0.15)", color: "#9467BD" };
      case "rare":
        return { bg: "rgba(28, 176, 246, 0.15)", color: "#1CB0F6" };
      case "uncommon":
        return { bg: "rgba(88, 204, 2, 0.15)", color: "#58CC02" };
      default:
        return { bg: "rgba(156, 163, 175, 0.15)", color: "#9CA3AF" };
    }
  };

  const categoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "learning":
        return { bg: "rgba(28, 176, 246, 0.1)", color: "#1CB0F6" };
      case "social":
        return { bg: "rgba(255, 75, 75, 0.1)", color: "#FF4B4B" };
      case "streak":
        return { bg: "rgba(255, 165, 0, 0.1)", color: "#FF8C00" };
      case "mastery":
        return { bg: "rgba(148, 103, 189, 0.1)", color: "#9467BD" };
      default:
        return { bg: "rgba(88, 204, 2, 0.1)", color: "#58CC02" };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Achievement Management</h1>
          <p className="text-muted-foreground text-sm">
            {achievements.length} achievement
            {achievements.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <CreateAchievementDialog />
      </div>

      {/* Achievement Grid */}
      {achievements.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No achievements found. Create your first achievement to get
            started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {achievements.map((achievement) => {
            const rColors = rarityColor(achievement.rarity);
            const cColors = categoryColor(achievement.category);
            return (
              <Card key={achievement.id} className="h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div
                      className="rounded-xl p-3 text-2xl shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: rColors.bg }}
                    >
                      {achievement.icon || "🏆"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm truncate">
                        {achievement.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: cColors.bg,
                        color: cColors.color,
                      }}
                    >
                      {achievement.category || "General"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: rColors.bg,
                        color: rColors.color,
                      }}
                    >
                      {achievement.rarity || "Common"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: "rgba(255, 75, 75, 0.1)",
                        color: "#FF4B4B",
                      }}
                    >
                      <Zap className="h-3 w-3 mr-0.5" />
                      {achievement.xp_reward ?? 0} XP
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
