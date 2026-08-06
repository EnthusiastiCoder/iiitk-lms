"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Shield,
  Users,
  BookOpen,
  Trophy,
  BarChart3,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface AdminMobileNavProps {
  profile: Profile | null;
}

const ACCENT = "#FF4B4B";

const navItems = [
  { href: "/admin", icon: Shield, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/courses", icon: BookOpen, label: "Courses" },
  { href: "/admin/achievements", icon: Trophy, label: "Achievements" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

export function AdminMobileNav({ profile }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const userName = profile?.full_name ?? "Admin";

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
                      color: active ? "#ffffff" : ACCENT,
                      backgroundColor: active
                        ? "rgba(255, 75, 75, 0.12)"
                        : undefined,
                      borderColor: active
                        ? ACCENT
                        : "rgba(255, 75, 75, 0.2)",
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
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback
                    className="text-sm font-bold"
                    style={{
                      backgroundColor: "rgba(255, 75, 75, 0.2)",
                      color: ACCENT,
                    }}
                  >
                    {userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
                <Shield
                  className="h-4 w-4 shrink-0"
                  style={{ color: ACCENT }}
                />
              </div>
            </div>

            <Separator />

            {/* Switch View Links */}
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/student"
                onClick={() => setOpen(false)}
                className="block hover:opacity-70 transition-opacity"
                style={{ opacity: 0.5 }}
              >
                <p className="text-sm leading-tight">Switch to Student View</p>
              </Link>
              <Link
                href="/professor"
                onClick={() => setOpen(false)}
                className="block hover:opacity-70 transition-opacity"
                style={{ opacity: 0.5 }}
              >
                <p className="text-sm leading-tight">Switch to Professor View</p>
              </Link>
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
        <Shield className="h-4 w-4" style={{ color: ACCENT }} />
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
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
