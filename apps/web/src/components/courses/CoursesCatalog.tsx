"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Search, BookOpen, Clock, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string | null;
  accent_color: string;
  difficulty: string;
  category: string;
  estimated_hours: number;
  prerequisites: string[] | null;
  tags: string[] | null;
  total_lessons: number;
  total_xp: number;
}

interface Enrollment {
  course_id: string;
  user_id: string;
}

interface Completion {
  lesson_id: string;
  course_id: string;
  completed_at: string;
}

interface CoursesCatalogProps {
  courses: Course[];
  enrollments: Enrollment[];
  completions: Completion[];
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/15 text-green-700 dark:text-green-400",
  intermediate: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  advanced: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function CoursesCatalog({
  courses,
  enrollments,
  completions,
}: CoursesCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.category));
    return ["all", ...Array.from(cats).sort()];
  }, [courses]);

  const enrolledCourseIds = useMemo(
    () => new Set(enrollments.map((e) => e.course_id)),
    [enrollments]
  );

  const completionsByCourse = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of completions) {
      map[c.course_id] = (map[c.course_id] ?? 0) + 1;
    }
    return map;
  }, [completions]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.tags ?? []).some((t) => t.toLowerCase().includes(q));
      const matchesCategory = category === "all" || c.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [courses, search, category]);

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No courses found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, i) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            const completedCount = completionsByCourse[course.id] ?? 0;
            const progressPercent =
              course.total_lessons > 0
                ? Math.round((completedCount / course.total_lessons) * 100)
                : 0;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link href={`/student/courses/${course.slug}`}>
                  <Card className="h-full hover:ring-2 hover:ring-primary/30 transition-all duration-200 cursor-pointer group">
                    {/* Accent top border */}
                    <div
                      className="h-1.5 rounded-t-xl"
                      style={{ backgroundColor: course.accent_color }}
                    />
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "shrink-0 capitalize text-[11px]",
                            difficultyColors[course.difficulty] ?? ""
                          )}
                        >
                          {course.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {course.total_lessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {course.estimated_hours}h
                        </span>
                      </div>
                      {isEnrolled && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">
                              {progressPercent}%
                            </span>
                          </div>
                          <Progress value={progressPercent} />
                        </div>
                      )}
                    </CardContent>
                    {isEnrolled && (
                      <CardFooter>
                        <span className="text-xs text-brand font-medium">
                          Enrolled
                        </span>
                      </CardFooter>
                    )}
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
