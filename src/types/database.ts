export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url: string;
  role: "student" | "professor" | "admin";
  department: string | null;
  institution: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  user_id: string;
  total_xp: number;
  level: number;
  xp_to_next_level: number;
  tier: "bronze" | "silver" | "gold" | "diamond";
  current_streak: number;
  longest_streak: number;
  total_lessons_completed: number;
  total_hours_learned: number;
  weekly_xp: number[];
  last_activity_date: string | null;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  accent_color: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "regular" | "backlog";
  estimated_hours: number;
  instructor_id: string | null;
  prerequisites: string[];
  tags: string[];
  total_lessons: number;
  total_xp: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  type: "reading" | "coding" | "quiz" | "mixed";
  estimated_minutes: number;
  xp_reward: number;
  content: { sections: ContentSection[] };
  created_at: string;
  updated_at: string;
}

export interface ContentSection {
  type: "text" | "code" | "callout";
  content?: string;
  code?: string;
  language?: string;
  editable?: boolean;
  output?: string;
  variant?: "info" | "warning" | "tip";
}

export interface Quiz {
  id: string;
  module_id: string | null;
  course_id: string;
  title: string;
  description: string;
  question_count: number;
  xp_reward: number;
  time_limit_minutes: number;
  is_final_exam: boolean;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  type: "multiple-choice" | "true-false" | "fill-blank";
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  xp_reward: number;
  order: number;
}

export interface Assignment {
  id: string;
  module_id: string | null;
  course_id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xp_reward: number;
  language: string;
  starter_code: string;
  requirements: string[];
  due_date: string | null;
}

export interface Project {
  id: string;
  module_id: string | null;
  course_id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xp_reward: number;
  language: string;
  starter_code: string;
  expected_output: string | null;
  requirements: string[];
  is_final_project: boolean;
  due_date: string | null;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
}

export interface LessonCompletion {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  xp_earned: number;
  completed_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "learning" | "streak" | "social" | "mastery";
  rarity: "common" | "rare" | "epic" | "legendary";
  xp_reward: number;
  condition_description: string | null;
  max_progress: number | null;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  earned: boolean;
  earned_at: string | null;
}

export interface CourseWithModules extends Course {
  modules: (Module & {
    lessons: Lesson[];
    quizzes: Quiz[];
    assignments: Assignment[];
    projects: Project[];
  })[];
}
