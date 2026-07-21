"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  User,
  Menu,
  Moon,
  Sun,
  GraduationCap,
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

interface ProfessorMobileNavProps {
  profile: Profile | null;
}

const ACCENT = "#1CB0F6";

const navItems = [
  { href: "/professor", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/professor/students", icon: Users, label: "Students" },
  { href: "/professor/grading", icon: ClipboardCheck, label: "Grading" },
  { href: "/professor/courses", icon: BookOpen, label: "Courses" },
  { href: "/professor/profile", icon: User, label: "Profile" },
];

export function ProfessorMobileNav({ profile }: ProfessorMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/professor") return pathname === "/professor";
    return pathname.startsWith(href);
  };

  const userName = profile?.full_name ?? "Professor";
  const department = profile?.department ?? "Computer Science";

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
                        ? "rgba(28, 176, 246, 0.12)"
                        : undefined,
                      borderColor: active
                        ? ACCENT
                        : "rgba(28, 176, 246, 0.2)",
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
                      backgroundColor: "rgba(28, 176, 246, 0.2)",
                      color: ACCENT,
                    }}
                  >
                    {userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground">{department}</p>
                </div>
                <GraduationCap
                  className="h-4 w-4 shrink-0"
                  style={{ color: ACCENT }}
                />
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
        <GraduationCap className="h-4 w-4" style={{ color: ACCENT }} />
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
