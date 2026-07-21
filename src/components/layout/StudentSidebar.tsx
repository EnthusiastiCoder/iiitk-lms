"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  BookOpen,
  Route,
  ClipboardList,
  Send,
  Trophy,
  Medal,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  role: string;
  department: string | null;
  institution: string | null;
}

interface Stats {
  user_id: string;
  total_xp: number;
  level: number;
  xp_to_next_level: number;
  tier: string;
  current_streak: number;
  longest_streak: number;
  weekly_xp: number;
}

interface StudentSidebarProps {
  profile: Profile | null;
  stats: Stats | null;
}

const navItems = [
  { href: "/student", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/student/courses", icon: BookOpen, label: "Courses" },
  { href: "/student/skill-tree", icon: Route, label: "Skill Tree" },
  { href: "/student/practice", icon: ClipboardList, label: "Practice" },
  { href: "/student/submissions", icon: Send, label: "Submissions" },
  { href: "/student/achievements", icon: Trophy, label: "Achievements" },
  { href: "/student/leaderboard", icon: Medal, label: "Leaderboard" },
  { href: "/student/profile", icon: User, label: "Profile" },
];

export function StudentSidebar({ profile, stats }: StudentSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const toggleCollapsed = () => setCollapsed((prev) => !prev);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const isActive = (href: string) => {
    if (href === "/student") return pathname === "/student";
    return pathname.startsWith(href);
  };

  const userName = profile?.full_name ?? "Student";
  const userLevel = stats?.level ?? 1;
  const totalXp = stats?.total_xp ?? 0;
  const xpToNext = stats?.xp_to_next_level ?? 100;
  const currentStreak = stats?.current_streak ?? 0;
  const xpPercent = xpToNext > 0 ? (totalXp / xpToNext) * 100 : 0;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen flex flex-col border-r bg-card border-border shrink-0 overflow-hidden"
    >
      {/* Logo + Collapse */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-4",
          collapsed && "justify-center px-2"
        )}
      >
        <Image
          src="/iiitk-logo.png"
          alt="IIIT Kalyani"
          width={48}
          height={48}
          className="h-12 w-auto shrink-0 object-contain"
        />
        {!collapsed && (
          <>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg tracking-tight leading-tight"
            >
              IIIT Kalyani
            </motion.span>
            <button
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              className="ml-auto p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <div className="flex-1 py-3 overflow-y-auto">
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger
                  render={<div />}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-large font-semibold transition-all duration-200 border-l-3",
                      "hover:bg-accent hover:scale-[1.02]",
                      collapsed && "justify-center px-2"
                    )}
                    style={{
                      color: active ? "#ffffff" : "#58CC02",
                      backgroundColor: active
                        ? "rgba(88, 204, 2, 0.12)"
                        : undefined,
                      borderColor: active
                        ? "#58CC02"
                        : "rgba(88, 204, 2, 0.2)",
                    }}
                  >
                    <div className="flex gap-2 py-1">
                      <item.icon className="h-5 w-5 shrink-0 mt-1" />
                      {!collapsed && <div>{item.label}</div>}
                    </div>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" sideOffset={10}>
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>
      </div>

      <Separator />

      {/* User Section */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-2 px-2 py-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-brand/20 text-brand text-xs font-bold">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-0.5 text-streak">
            <Flame className="h-3.5 w-3.5 animate-streak" />
            <span className="text-xs font-bold">{currentStreak}</span>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-brand/20 text-brand text-sm font-bold">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">
                Level {userLevel}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1 rounded-lg hover:bg-accent transition-colors"
            >
              {theme === "dark" ? (
                <Moon className="h-4 w-4 text-indigo-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </button>
            <div className="flex items-center gap-1 text-streak">
              <Flame className="h-4 w-4 animate-streak" />
              <span className="text-xs font-bold">{currentStreak}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={xpPercent} className="h-2 flex-1" />
            <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
              {totalXp}/{xpToNext} XP
            </span>
          </div>
        </div>
      )}

      {/* Collapsed: theme toggle + expand */}
      {collapsed && (
        <div className="px-2 py-2 flex flex-col gap-1">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {theme === "dark" ? (
              <Moon className="h-5 w-5 shrink-0 text-indigo-400" />
            ) : (
              <Sun className="h-5 w-5 shrink-0 text-amber-400" />
            )}
          </button>
          <button
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
            className="flex items-center justify-center p-2 rounded-lg transition-colors text-muted-foreground/40 hover:text-foreground hover:bg-accent"
          >
            <PanelLeftOpen className="h-5 w-5 shrink-0" />
          </button>
        </div>
      )}

      {/* Professor link */}
      {!collapsed && (
        <Link
          href="/professor"
          className="block px-4 pt-3 pb-8 text-center select-none hover:opacity-50 transition-opacity"
          style={{ opacity: 0.3 }}
        >
          <p className="text-xl leading-tight">Dr. Imon Mukherjee</p>
          <p className="text-base leading-tight mt-1">
            Assistant Professor, IIIT Kalyani
          </p>
        </Link>
      )}
    </motion.aside>
  );
}
