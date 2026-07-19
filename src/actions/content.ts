"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logInfo, logError } from "@/lib/logger";

async function requireProfessorOrAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "professor" && profile.role !== "admin")) {
    throw new Error("Unauthorized: professor or admin role required");
  }

  return { supabase, user };
}

// ---------- Module CRUD ----------

export async function createModule(
  courseId: string,
  data: { title: string; description: string }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  // Get the next order value
  const { data: existing } = await supabase
    .from("modules")
    .select("order")
    .eq("course_id", courseId)
    .order("order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order ?? 0) + 1;
  const id = `mod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("modules").insert({
    id,
    course_id: courseId,
    title: data.title,
    description: data.description,
    order: nextOrder,
  });

  if (error) {
    logError("content.module.create.failed", error.message, { professorId: user.id, courseId });
    throw new Error(error.message);
  }

  logInfo("content.module.create", { professorId: user.id, type: "module", title: data.title, courseId, moduleId: id });
  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function updateModule(
  moduleId: string,
  data: { title: string; description: string }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("modules")
    .update({
      title: data.title,
      description: data.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", moduleId);

  if (error) throw new Error(error.message);

  logInfo("content.module.update", { professorId: user.id, type: "module", moduleId, title: data.title });
  revalidatePath("/professor/courses");
  return { success: true };
}

export async function deleteModule(moduleId: string) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const { error } = await supabase.from("modules").delete().eq("id", moduleId);

  if (error) throw new Error(error.message);

  logInfo("content.module.delete", { professorId: user.id, type: "module", moduleId });
  revalidatePath("/professor/courses");
  return { success: true };
}

// ---------- Lesson CRUD ----------

export async function createLesson(
  moduleId: string,
  courseId: string,
  data: {
    title: string;
    description: string;
    type: string;
    estimatedMinutes: number;
    xpReward: number;
    content: any;
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  // Get the next order value
  const { data: existing } = await supabase
    .from("lessons")
    .select("order")
    .eq("module_id", moduleId)
    .order("order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order ?? 0) + 1;
  const id = `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("lessons").insert({
    id,
    module_id: moduleId,
    course_id: courseId,
    title: data.title,
    description: data.description,
    order: nextOrder,
    type: data.type,
    estimated_minutes: data.estimatedMinutes,
    xp_reward: data.xpReward,
    content: data.content,
  });

  if (error) {
    logError("content.lesson.create.failed", error.message, { professorId: user.id, moduleId, courseId });
    throw new Error(error.message);
  }

  // Update total_lessons on the course
  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact" })
    .eq("course_id", courseId);

  await supabase
    .from("courses")
    .update({ total_lessons: count ?? 0 })
    .eq("id", courseId);

  logInfo("content.lesson.create", { professorId: user.id, type: "lesson", title: data.title, courseId, moduleId, lessonId: id });
  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function updateLesson(
  lessonId: string,
  data: Partial<{
    title: string;
    description: string;
    type: string;
    estimatedMinutes: number;
    xpReward: number;
    content: any;
  }>
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.estimatedMinutes !== undefined)
    updateData.estimated_minutes = data.estimatedMinutes;
  if (data.xpReward !== undefined) updateData.xp_reward = data.xpReward;
  if (data.content !== undefined) updateData.content = data.content;
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("lessons")
    .update(updateData)
    .eq("id", lessonId);

  if (error) throw new Error(error.message);

  logInfo("content.lesson.update", { professorId: user.id, type: "lesson", lessonId });
  revalidatePath("/professor/courses");
  return { success: true };
}

export async function deleteLesson(lessonId: string) {
  const { supabase, user } = await requireProfessorOrAdmin();

  // Get course_id before deleting
  const { data: lesson } = await supabase
    .from("lessons")
    .select("course_id")
    .eq("id", lessonId)
    .single();

  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

  if (error) throw new Error(error.message);

  // Update total_lessons on the course
  if (lesson?.course_id) {
    const { count } = await supabase
      .from("lessons")
      .select("id", { count: "exact" })
      .eq("course_id", lesson.course_id);

    await supabase
      .from("courses")
      .update({ total_lessons: count ?? 0 })
      .eq("id", lesson.course_id);
  }

  logInfo("content.lesson.delete", { professorId: user.id, type: "lesson", lessonId });
  revalidatePath("/professor/courses");
  return { success: true };
}

// ---------- Quiz CRUD ----------

export async function createQuiz(
  moduleId: string,
  courseId: string,
  data: {
    title: string;
    description: string;
    timeLimit: number;
    xpReward: number;
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  const id = `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("quizzes").insert({
    id,
    module_id: moduleId,
    course_id: courseId,
    title: data.title,
    description: data.description,
    time_limit_minutes: data.timeLimit,
    xp_reward: data.xpReward,
    question_count: 0,
  });

  if (error) throw new Error(error.message);

  logInfo("content.quiz.create", { professorId: user.id, type: "quiz", title: data.title, courseId, moduleId, quizId: id });
  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function createQuizQuestion(
  quizId: string,
  data: {
    type: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    xpReward: number;
  }
) {
  const { supabase, user } = await requireProfessorOrAdmin();

  // Get the next order value
  const { data: existing } = await supabase
    .from("quiz_questions")
    .select("order")
    .eq("quiz_id", quizId)
    .order("order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order ?? 0) + 1;
  const id = `qq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("quiz_questions").insert({
    id,
    quiz_id: quizId,
    type: data.type,
    question: data.question,
    options: data.options,
    correct_answer: data.correctAnswer,
    explanation: data.explanation,
    xp_reward: data.xpReward,
    order: nextOrder,
  });

  if (error) throw new Error(error.message);

  // Update question_count on the quiz
  const { count } = await supabase
    .from("quiz_questions")
    .select("id", { count: "exact" })
    .eq("quiz_id", quizId);

  await supabase
    .from("quizzes")
    .update({ question_count: count ?? 0 })
    .eq("id", quizId);

  logInfo("content.quiz_question.create", { professorId: user.id, type: "quiz_question", quizId, questionId: id });
  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function updateQuiz(
  quizId: string,
  data: {
    title: string;
    description: string;
    timeLimit: number;
    xpReward: number;
  }
) {
  const { supabase } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("quizzes")
    .update({
      title: data.title,
      description: data.description,
      time_limit_minutes: data.timeLimit,
      xp_reward: data.xpReward,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quizId);

  if (error) throw new Error(error.message);

  revalidatePath("/professor/courses");
  return { success: true };
}

export async function updateQuizQuestion(
  questionId: string,
  data: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }
) {
  const { supabase } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("quiz_questions")
    .update({
      question: data.question,
      options: data.options,
      correct_answer: data.correctAnswer,
      explanation: data.explanation,
      updated_at: new Date().toISOString(),
    })
    .eq("id", questionId);

  if (error) throw new Error(error.message);

  revalidatePath("/professor/courses");
  return { success: true };
}

export async function deleteQuiz(quizId: string) {
  const { supabase } = await requireProfessorOrAdmin();

  // Delete questions first
  await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);

  const { error } = await supabase.from("quizzes").delete().eq("id", quizId);

  if (error) throw new Error(error.message);

  revalidatePath("/professor/courses");
  return { success: true };
}

// ---------- Assignment CRUD ----------

export async function createAssignment(
  moduleId: string,
  courseId: string,
  data: {
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    language: string;
    starterCode: string;
    requirements: string[];
    dueDate?: string;
  }
) {
  const { supabase } = await requireProfessorOrAdmin();

  const id = `asgn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("assignments").insert({
    id,
    module_id: moduleId,
    course_id: courseId,
    title: data.title,
    description: data.description,
    difficulty: data.difficulty,
    xp_reward: data.xpReward,
    language: data.language,
    starter_code: data.starterCode,
    requirements: data.requirements,
    due_date: data.dueDate || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function updateAssignment(
  assignmentId: string,
  data: {
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    language: string;
    starterCode: string;
    requirements: string[];
    dueDate?: string;
  }
) {
  const { supabase } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("assignments")
    .update({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      xp_reward: data.xpReward,
      language: data.language,
      starter_code: data.starterCode,
      requirements: data.requirements,
      due_date: data.dueDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assignmentId);

  if (error) throw new Error(error.message);

  revalidatePath("/professor/courses");
  return { success: true };
}

export async function deleteAssignment(assignmentId: string) {
  const { supabase } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) throw new Error(error.message);

  revalidatePath("/professor/courses");
  return { success: true };
}

// ---------- Project CRUD ----------

export async function createProject(
  moduleId: string,
  courseId: string,
  data: {
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    language: string;
    starterCode: string;
    requirements: string[];
  }
) {
  const { supabase } = await requireProfessorOrAdmin();

  const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("projects").insert({
    id,
    module_id: moduleId,
    course_id: courseId,
    title: data.title,
    description: data.description,
    difficulty: data.difficulty,
    xp_reward: data.xpReward,
    language: data.language,
    starter_code: data.starterCode,
    requirements: data.requirements,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/professor/courses");
  return { success: true, id };
}

export async function updateProject(
  projectId: string,
  data: {
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    language: string;
    starterCode: string;
    requirements: string[];
  }
) {
  const { supabase } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("projects")
    .update({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      xp_reward: data.xpReward,
      language: data.language,
      starter_code: data.starterCode,
      requirements: data.requirements,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  revalidatePath("/professor/courses");
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const { supabase } = await requireProfessorOrAdmin();

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  revalidatePath("/professor/courses");
  return { success: true };
}

// ---------- Enhanced Data Fetching ----------

export async function getCourseContentForProfessor(slug: string) {
  const { supabase } = await requireProfessorOrAdmin();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) return null;

  const [modulesResult, lessonsResult, quizzesResult, assignmentsResult, projectsResult] =
    await Promise.all([
      supabase
        .from("modules")
        .select("*")
        .eq("course_id", course.id)
        .order("order"),
      supabase
        .from("lessons")
        .select('id, module_id, title, description, "order", type, estimated_minutes, xp_reward, content')
        .eq("course_id", course.id)
        .order("order"),
      supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", course.id)
        .order("created_at"),
      supabase
        .from("assignments")
        .select("*")
        .eq("course_id", course.id)
        .order("created_at"),
      supabase
        .from("projects")
        .select("*")
        .eq("course_id", course.id)
        .order("created_at"),
    ]);

  const modules = modulesResult.data ?? [];
  const lessons = lessonsResult.data ?? [];
  const quizzes = quizzesResult.data ?? [];
  const assignments = assignmentsResult.data ?? [];
  const projects = projectsResult.data ?? [];

  return {
    ...course,
    modules: modules.map((m: any) => ({
      ...m,
      lessons: lessons.filter((l: any) => l.module_id === m.id),
      quizzes: quizzes.filter((q: any) => q.module_id === m.id),
      assignments: assignments.filter((a: any) => a.module_id === m.id),
      projects: projects.filter((p: any) => p.module_id === m.id),
    })),
  };
}
