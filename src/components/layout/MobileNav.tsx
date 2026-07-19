"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  BookOpen,
  Route,
  ClipboardList,
  Send,
  Trophy,
  Medal,
  User,
  Menu,
  Moon,
  Sun,
  Flame,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

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

interface MobileNavProps {
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

export function MobileNav({ profile, stats }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

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
    <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-card border-border">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-accent transition-colors text-foreground"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>

            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-4">
              <Image
                src="/iiitk-logo.png"
                alt="IIIT Kalyani"
                width={40}
                height={40}
                className="h-10 w-auto shrink-0 object-contain"
              />
              <span className="text-lg tracking-tight leading-tight">
                IIIT Kalyani
              </span>
            </div>

            <Separator />

            {/* Nav Items */}
            <nav className="flex flex-col gap-1 px-3 py-3 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-semibold transition-all duration-200 border-l-3",
                      "hover:bg-accent hover:scale-[1.02]"
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
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <Separator />

            {/* User Section */}
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
          </SheetContent>
        </Sheet>

        <Image
          src="/iiitk-logo.png"
          alt="IIIT Kalyani"
          width={32}
          height={32}
          className="h-8 w-auto object-contain"
        />
        <span className="text-sm font-semibold tracking-tight">IIIT Kalyani</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-streak">
          <Flame className="h-4 w-4 animate-streak" />
          <span className="text-xs font-bold">{currentStreak}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-3.5 w-3.5 text-brand" />
          <span className="text-xs font-bold">{totalXp}</span>
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4 text-indigo-400" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400" />
          )}
        </button>
      </div>
    </div>
  );
}
