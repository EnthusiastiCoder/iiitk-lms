import { supabase } from "../db/supabase.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger("skill-tree.service");

/** Minimal course info for the skill tree course selector. */
interface SkillTreeCourse {
  id: string;
  title: string;
  accent_color: string;
}

/** A node in the skill tree graph. */
interface SkillTreeNode {
  id: string;
  course_id: string;
  label: string;
  description: string | null;
  x: number;
  y: number;
  prerequisite_ids: string[] | null;
  lesson_ids: string[] | null;
  icon: string | null;
}

/** An edge connecting two skill tree nodes. */
interface SkillTreeEdge {
  id: string;
  course_id: string;
  from_node_id: string;
  to_node_id: string;
}

/** Aggregated skill tree response data. */
export interface SkillTreeData {
  courses: SkillTreeCourse[];
  nodes: SkillTreeNode[];
  edges: SkillTreeEdge[];
}

/**
 * Fetch skill tree data: all courses and optionally nodes/edges for a course.
 *
 * Steps:
 * 1. Get all courses (id, title, accent_color) for the selector dropdown.
 * 2. If a courseId is provided, fetch skill_tree_nodes and skill_tree_edges.
 * 3. Return the combined data.
 *
 * @param courseId - Optional course UUID to load nodes and edges for
 * @returns Skill tree data containing courses, nodes, and edges
 */
export async function getSkillTreeData(
  courseId?: string
): Promise<SkillTreeData> {
  const courses = await fetchAllCourses();

  if (!courseId) {
    logger.info("skill_tree_courses_only", { courseCount: courses.length });
    return { courses, nodes: [], edges: [] };
  }

  const [nodes, edges] = await Promise.all([
    fetchNodesForCourse(courseId),
    fetchEdgesForCourse(courseId),
  ]);

  logger.info("skill_tree_fetched", {
    courseId,
    nodeCount: nodes.length,
    edgeCount: edges.length,
  });

  return { courses, nodes, edges };
}

/**
 * Fetch all courses with fields needed for the skill tree selector.
 * @returns Array of courses with id, title, and accent_color
 */
async function fetchAllCourses(): Promise<SkillTreeCourse[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, accent_color")
    .order("title");

  if (error) {
    logger.error("skill_tree_courses_failed", error, {});
    throw error;
  }

  return (data ?? []) as SkillTreeCourse[];
}

/**
 * Fetch skill tree nodes for a specific course.
 * @param courseId - UUID of the course
 * @returns Array of skill tree node records
 */
async function fetchNodesForCourse(
  courseId: string
): Promise<SkillTreeNode[]> {
  const { data, error } = await supabase
    .from("skill_tree_nodes")
    .select("*")
    .eq("course_id", courseId)
    .order("y")
    .order("x");

  if (error) {
    logger.error("skill_tree_nodes_failed", error, { courseId });
    throw error;
  }

  return (data ?? []) as SkillTreeNode[];
}

/**
 * Fetch skill tree edges for a specific course.
 * @param courseId - UUID of the course
 * @returns Array of skill tree edge records
 */
async function fetchEdgesForCourse(
  courseId: string
): Promise<SkillTreeEdge[]> {
  const { data, error } = await supabase
    .from("skill_tree_edges")
    .select("*")
    .eq("course_id", courseId);

  if (error) {
    logger.error("skill_tree_edges_failed", error, { courseId });
    throw error;
  }

  return (data ?? []) as SkillTreeEdge[];
}
