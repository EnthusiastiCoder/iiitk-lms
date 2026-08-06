"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityDay {
  date: string;
  xp: number;
  lessons: number;
}

interface ActivityHeatmapProps {
  data: ActivityDay[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const dataMap = new Map(data.map((d) => [d.date, d]));

  const today = new Date();
  const days: { date: string; xp: number; lessons: number }[] = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = dataMap.get(dateStr);
    days.push({
      date: dateStr,
      xp: entry?.xp ?? 0,
      lessons: entry?.lessons ?? 0,
    });
  }

  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const maxXp = Math.max(...days.map((d) => d.xp), 1);

  function getColor(xp: number): string {
    if (xp === 0) return "hsl(var(--muted))";
    const intensity = Math.min(xp / maxXp, 1);
    if (intensity < 0.25) return "#58CC0230";
    if (intensity < 0.5) return "#58CC0260";
    if (intensity < 0.75) return "#58CC0290";
    return "#58CC02";
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div>
      <div className="flex gap-[2px] overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[2px]">
            {week.map((day) => (
              <Tooltip key={day.date}>
                <TooltipTrigger>
                  <div
                    className="w-[10px] h-[10px] rounded-[2px] transition-colors"
                    style={{ backgroundColor: getColor(day.xp) }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  <p className="text-muted-foreground">{day.xp} XP · {day.lessons} lessons</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((level, i) => (
          <div
            key={i}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{ backgroundColor: getColor(level * maxXp) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
