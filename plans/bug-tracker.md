# Bug Tracker Feature Plan

## Overview
In-app bug tracking for testers. New `tester` role. Claude interacts via MCP endpoints built into the Express API.

## Database

### `bugs` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| title | text | Required |
| description | text | Required |
| severity | text | critical, high, medium, low |
| status | text | open, in_progress, resolved, closed |
| screenshots | text[] | Up to 3 Cloudinary URLs |
| reporter_id | uuid FK → profiles | |
| assigned_to | text | "claude" or null |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `bug_comments` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| bug_id | uuid FK → bugs | |
| author_id | uuid FK → profiles | Null for system/Claude comments |
| author_name | text | Display name or "Claude" |
| message | text | |
| is_system | boolean | True for auto-generated comments |
| created_at | timestamptz | |

## API Endpoints

### Tester endpoints (require tester/admin role)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/bugs | List all bugs (filterable by status, severity) |
| GET | /api/bugs/:id | Get bug with comments |
| POST | /api/bugs | Create bug (title, description, severity, screenshots) |
| PATCH | /api/bugs/:id | Update bug (status, severity) |
| POST | /api/bugs/:id/comments | Add comment |
| POST | /api/bugs/:id/close | Close bug |
| POST | /api/bugs/:id/reopen | Reopen bug |

### MCP endpoints (for Claude, uses API key auth)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/mcp/bugs | List open bugs |
| GET | /api/mcp/bugs/:id | Get bug with comments |
| POST | /api/mcp/bugs/:id/reply | Post a comment as Claude |
| PATCH | /api/mcp/bugs/:id/status | Update status (in_progress, resolved) |

## Frontend

### Tester layout (`apps/web/src/app/(tester)/`)
- Layout with tester sidebar (Bugs, Profile)
- `/tester/bugs` — bug list with filters (status, severity)
- `/tester/bugs/new` — submit bug form (title, description, severity, up to 3 screenshots)
- `/tester/bugs/[id]` — bug detail with comment thread

### Components
- `BugCard` — bug summary card with severity badge, status, screenshot count
- `BugForm` — create/edit bug form with screenshot upload
- `BugCommentThread` — comment list with system message styling for Claude replies
- `TesterSidebar` — navigation sidebar for tester role

## MCP Server Config
Add to `.mcp.json`:
```json
"bug-tracker": {
  "command": "node",
  "args": ["apps/api/src/mcp/server.js"],
  "env": { "API_URL": "https://iiitk-lms.onrender.com", "MCP_API_KEY": "..." }
}
```

Or since MCP endpoints are in Express, Claude calls them via the existing webfetch MCP or direct HTTP.

## Auth Flow
- Add `tester` to the role enum in profiles
- Tester layout checks role === "tester" or role === "admin"
- Admin can assign tester role to users from the admin panel
- Register page gets a "tester" option (or admin assigns post-registration)

## Commits
1. Add bugs and bug_comments tables (Supabase migration SQL)
2. Add tester role to shared types and auth
3. Add bug service and routes in Express API
4. Add MCP bug endpoints in Express API
5. Add tester layout and sidebar
6. Add bug list page
7. Add bug submission page
8. Add bug detail page with comments
9. Add MCP config for Claude access
