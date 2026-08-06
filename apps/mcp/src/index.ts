#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_URL = process.env.API_URL || "http://localhost:10000";
const MCP_API_KEY = process.env.MCP_API_KEY || "";

// --- HTTP helper ---

async function api(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = {
    "x-mcp-key": MCP_API_KEY,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

// --- Formatters ---

interface Bug {
  _id: string;
  title: string;
  status: string;
  severity: string;
  reportedBy?: { name?: string };
  createdAt?: string;
  description?: string;
  steps?: string;
  expected?: string;
  actual?: string;
  comments?: Comment[];
}

interface Comment {
  author?: { name?: string };
  message?: string;
  createdAt?: string;
}

function formatBugList(bugs: Bug[]): string {
  if (!bugs.length) return "No bugs found.";

  const lines = bugs.map((b) => {
    const severity = b.severity?.toUpperCase() || "?";
    const status = b.status || "open";
    const reporter = b.reportedBy?.name || "Unknown";
    const date = b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "";
    return `- **[${severity}]** ${b.title}\n  ID: \`${b._id}\` | Status: ${status} | Reporter: ${reporter} | ${date}`;
  });

  return `## Open Bugs (${bugs.length})\n\n${lines.join("\n\n")}`;
}

function formatBugDetail(bug: Bug): string {
  const parts: string[] = [];

  parts.push(`## ${bug.title}`);
  parts.push(`**ID:** \`${bug._id}\``);
  parts.push(`**Status:** ${bug.status} | **Severity:** ${bug.severity}`);
  parts.push(`**Reporter:** ${bug.reportedBy?.name || "Unknown"}`);

  if (bug.createdAt) {
    parts.push(`**Created:** ${new Date(bug.createdAt).toLocaleString()}`);
  }

  if (bug.description) {
    parts.push(`\n### Description\n${bug.description}`);
  }
  if (bug.steps) {
    parts.push(`\n### Steps to Reproduce\n${bug.steps}`);
  }
  if (bug.expected) {
    parts.push(`\n### Expected Behavior\n${bug.expected}`);
  }
  if (bug.actual) {
    parts.push(`\n### Actual Behavior\n${bug.actual}`);
  }

  if (bug.comments?.length) {
    parts.push(`\n### Comments (${bug.comments.length})`);
    for (const c of bug.comments) {
      const author = c.author?.name || "Unknown";
      const date = c.createdAt
        ? new Date(c.createdAt).toLocaleString()
        : "";
      parts.push(`\n**${author}** (${date}):\n${c.message}`);
    }
  } else {
    parts.push("\n*No comments yet.*");
  }

  return parts.join("\n");
}

// --- MCP Server ---

const server = new Server(
  { name: "lms-bug-tracker", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_bugs",
      description:
        "List bugs in the LMS bug tracker. Returns a formatted list with severity, status, and reporter.",
      inputSchema: {
        type: "object" as const,
        properties: {
          status: {
            type: "string",
            enum: ["open", "in_progress", "resolved", "closed"],
            description: "Filter by bug status (default: open)",
          },
          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low"],
            description: "Filter by severity level",
          },
        },
      },
    },
    {
      name: "get_bug",
      description:
        "Get full details of a specific bug including description, steps to reproduce, and all comments.",
      inputSchema: {
        type: "object" as const,
        properties: {
          bug_id: {
            type: "string",
            description: "The bug ID",
          },
        },
        required: ["bug_id"],
      },
    },
    {
      name: "reply_to_bug",
      description:
        "Post a comment on a bug as Claude. Use this to provide analysis, suggest fixes, or ask clarifying questions.",
      inputSchema: {
        type: "object" as const,
        properties: {
          bug_id: {
            type: "string",
            description: "The bug ID to comment on",
          },
          message: {
            type: "string",
            description: "The comment message to post",
          },
        },
        required: ["bug_id", "message"],
      },
    },
    {
      name: "update_bug_status",
      description:
        "Update the status of a bug. Use 'in_progress' when starting work and 'resolved' when a fix is confirmed.",
      inputSchema: {
        type: "object" as const,
        properties: {
          bug_id: {
            type: "string",
            description: "The bug ID to update",
          },
          status: {
            type: "string",
            enum: ["in_progress", "resolved"],
            description: "The new status",
          },
        },
        required: ["bug_id", "status"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_bugs": {
        const params = new URLSearchParams();
        if (args?.status) params.set("status", String(args.status));
        if (args?.severity) params.set("severity", String(args.severity));
        const qs = params.toString();
        const path = `/api/mcp/bugs${qs ? `?${qs}` : ""}`;
        const data = (await api("GET", path)) as Bug[];
        return { content: [{ type: "text", text: formatBugList(data) }] };
      }

      case "get_bug": {
        const bugId = String(args?.bug_id);
        const data = (await api("GET", `/api/mcp/bugs/${bugId}`)) as Bug;
        return { content: [{ type: "text", text: formatBugDetail(data) }] };
      }

      case "reply_to_bug": {
        const bugId = String(args?.bug_id);
        const message = String(args?.message);
        await api("POST", `/api/mcp/bugs/${bugId}/reply`, { message });
        return {
          content: [
            {
              type: "text",
              text: `Comment posted on bug \`${bugId}\`.`,
            },
          ],
        };
      }

      case "update_bug_status": {
        const bugId = String(args?.bug_id);
        const status = String(args?.status);
        await api("PATCH", `/api/mcp/bugs/${bugId}/status`, { status });
        return {
          content: [
            {
              type: "text",
              text: `Bug \`${bugId}\` status updated to **${status}**.`,
            },
          ],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// --- Start ---

const transport = new StdioServerTransport();
await server.connect(transport);
