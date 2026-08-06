# CLAUDE.md

## Shell
- The working directory is already `c:\Users\enthu\Projects\LMSI`. Do not prefix commands with `cd c:\Users\enthu\Projects\LMSI &&`. Just run commands directly.

## Git Commits
- Never add Co-Authored-By lines to commit messages.
- Always check file contents (git diff or read) BEFORE running git add + git commit. Verify only the intended change is included. Never batch multiple changes into one commit.
- Always run `git add` and `git commit` as separate commands. Never chain them with `&&`.
- After the initial setup commit, commit one file at a time — favor more small, granular commits over fewer large ones. Only group multiple files in a single commit when they are inseparable parts of one atomic change.

## Git Branching
- Never commit directly to `main` unless the user explicitly asks to.
- At the start of work, check the current branch. Continue on that branch, or create a new one if on `main`.
- Branch naming: `fix/short-desc`, `feat/short-desc`, `chore/short-desc`.

## Planning
- When planning, always output the plan to a markdown file in the `plans/` folder (not inline in chat).
- Always ask questions to remove ambiguity before starting implementation.
- When implementation is asked to be planned, always plan commits (as many as possible), acceptance criteria, and tests (if applicable).

## Cross-Questioning
- Before starting ANY task — building, editing, or changing anything, no matter how small — ask clarifying questions first so we both confirm we're on the same page.
- Use the question tool (AskUserQuestion). For each decision, present concrete options, each with a recommendation (mark the best option `(Recommended)`) and the pros/cons or trade-offs of each.
- Wait for the answers before proceeding. This is the same protocol as regular clarifying questions.

## Research
- Save research notes and findings as markdown files in the `research/` folder.
- Use the WebFetch MCP to access the internet freely for research (see `prompts/webfetch-mcp.md`).

## Database Migrations
- Every mutating migration (schema or data) must follow this gate: (1) run a **dry-run** that shows the exact SQL/DDL and data impact, (2) we **both review** it, (3) it executes **only on your explicit approval**.
- Never mutate the database outside a migration — no ad-hoc `sqlite3` writes, no manual row edits. The migration is the single source of truth for any schema/data change.
- Migrations must be reversible where possible (provide a down/rollback path).
- The allowlist hook forces migration-apply commands to prompt. Do not try to bypass it.

## Chrome DevTools MCP
- When using the Chrome DevTools MCP, close unused tabs. Keep a maximum of 6 tabs open at once. If more, close some before opening new ones.

## Additional Instructions
- The `prompts/` folder contains detailed tool-specific instructions and workflows. Read the relevant prompt file before using that tool for the first time in a session.
- A PreToolUse allowlist hook (`.claude/hooks/check-allowlist.py`) auto-approves allowlisted commands and hard-blocks pushes to `origin main` and all force-pushes. Destructive git ops (`reset --hard`, `clean -f*`, discarding `checkout`/`restore`, `branch -D`) and mutating DB migrations always prompt.
- Run the `introspect` skill (`/introspect`) at the end of every session to log mistakes, root causes, and lessons.
- Current prompts:
  - `prompts/webfetch-mcp.md` — WebFetch MCP: web browsing, search, extraction, crawling, browser automation.
  - `prompts/chrome-devtools-mcp.md` — Chrome DevTools MCP: browser debugging, performance, memory profiling, Lighthouse audits.
  - `prompts/ui-critique-mcp.md` — UI Critique MCP: Gemini-powered screenshot analysis for structured UI/UX feedback.
  - `prompts/setup-workspace.md` — Workspace setup: this prompt itself, moved here after initial setup.
