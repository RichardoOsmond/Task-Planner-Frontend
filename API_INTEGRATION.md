# Task Planner — Backend API Integration Guide

Reference for the frontend. This describes the **actual implemented** ASP.NET Core backend the React app talks to.

## Basics

- **Base URL (dev):** `https://localhost:7066` — put this in a `.env` as `VITE_API_URL` and read it via `import.meta.env.VITE_API_URL`. Never hardcode it. (Swap for the deployed URL later.)
- **CORS:** the backend already allows origin `http://localhost:5173` (the Vite dev server). When deployed, the backend must add the live frontend URL to its CORS policy.
- **JSON:** all requests/responses are JSON, **camelCase** field names.
- **Dates:** ISO 8601 UTC strings (e.g. `"2026-08-09T14:30:00Z"`). Nullable dates come back as `null`.
- **Content-Type:** send `Content-Type: application/json` on POST/PUT bodies.

## Auth

Two public endpoints (no token needed):

### POST `/api/auth/register`
Body: `{ "userName": string, "email": string, "password": string }`
- **200** `{ "message": "User registered successfully!" }`
- **400** `[ { "code": "...", "description": "..." }, ... ]` (Identity validation errors)
- **Password rules:** min length 8, and must contain uppercase, lowercase, a digit, and a non-alphanumeric character (e.g. `Test1234!`). Enforce/communicate this in the UI.

### POST `/api/auth/login`
Body: `{ "userName": string, "password": string }`
- **200** `{ "token": "<JWT>" }`
- **401** `"Invalid Username or Password"` (same message whether user or password is wrong — by design)

### Using the token
- The JWT is a bearer token; **it expires in 2 hours**. It carries the user's id and username as claims (the backend reads the id from it — the frontend never sends a user id).
- Send it on **every** `/api/tasks`, `/api/goals`, `/api/analytics` request as a header:
  `Authorization: Bearer <token>`
- Missing/invalid token on a protected route → **401**.
- **Token storage** is an open security decision (localStorage is convenient but XSS-exposed; httpOnly cookie is safer but needs backend changes; in-memory is safe-but-lost-on-refresh). Decide deliberately when wiring login; for a first pass many start with localStorage and revisit.

## Tasks  (all require `Authorization: Bearer`)

**TaskItem shape:** `{ id, goalId (int|null), userId, name, duration (int, minutes), description, createdDate, completedDate (string|null), dueDate (string|null) }`

- **GET** `/api/tasks?goalId=&status=&due=` — current user's tasks. Optional filters: `goalId` (int), `status` = `completed` | `pending`, `due` = `today`. → `200` array of TaskItem.
- **GET** `/api/tasks/{id}` — one task (must be yours). → `200` TaskItem, or `404`.
- **POST** `/api/tasks` — create. Send `{ name, description, duration, goalId?, dueDate? }`. (Server sets `userId` from the token and `createdDate`; sending them is ignored.) → `201` with the created TaskItem (includes its new `id`). `400` if `goalId` isn't one of your goals.
- **PUT** `/api/tasks/{id}` — update. Send the full task incl. `id` matching the URL. Updates name/description/duration/goalId/completedDate/dueDate. → `204`, or `404`/`400`.
- **PATCH** `/api/tasks/{id}/complete` — toggles complete/incomplete (sets or clears `completedDate`). No body. → `204`.
- **DELETE** `/api/tasks/{id}` → `204`, or `404`.

## Goals  (all require `Authorization: Bearer`)

**Goal shape:** `{ id, userId, parentGoalId (int|null), name, description, createdDate, targetDate (string|null) }`
(A goal with `parentGoalId = null` is top-level; a set `parentGoalId` makes it a sub-goal. Nav fields like sub-goals/tasks are not populated in responses — fetch them via the endpoints below.)

- **GET** `/api/goals?parentGoalId=` — no param → your **top-level** goals; `?parentGoalId=5` → sub-goals of goal 5. → `200` array of Goal.
- **GET** `/api/goals/{id}` — one goal (must be yours). → `200` Goal, or `404`.
- **POST** `/api/goals` — create. Send `{ name, description, parentGoalId?, targetDate? }`. → `201` with the created Goal.
- **PUT** `/api/goals/{id}` — update name/description/targetDate/parentGoalId. Rejects self-parent and cycles (`400`). → `204`.
- **DELETE** `/api/goals/{id}?deleteAll=true|false` —
  - `deleteAll=false` → deletes just this goal; its sub-goals become top-level and its tasks become standalone.
  - `deleteAll=true` → deletes this goal and its entire sub-goal subtree and their tasks.
  - → `204`.
- **GET** `/api/goals/{id}/tasks` — tasks under a goal (yours only). → `200` array of TaskItem.

## Analytics  (all require `Authorization: Bearer`)

- **GET** `/api/analytics/summary` → `200`
  `{ todayCount, totalCompletedTasks, totalTasks, pendingTasks, completionRate (0–100 int), activeGoals, streak }`
- **GET** `/api/analytics/productivity?range=Week|Month|SixMonths|Year` → `200` ordered array of `{ date: "yyyy-MM-dd", count }`. Bucketing: Week=7 days, Month=30 days, SixMonths=26 weeks, Year=12 months. Empty buckets are included as `count: 0` (good for charts).
- **GET** `/api/analytics/activity?days=365` → `200` ordered daily array of `{ date, count }` (GitHub-style heatmap data from the activity log).

## Timezone note

Analytics (streak, "today", buckets) are computed in the user's stored timezone (`User.TimeZoneId`, currently defaulting to `Asia/Kuala_Lumpur`). There is **no endpoint yet** to set it. A planned enhancement is for the frontend to detect the browser timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) and send it at register/login — not built yet, so it defaults for now.

## Status codes you'll handle

`200` OK · `201` Created · `204` No Content (updates/deletes) · `400` Bad Request · `401` Unauthorized (missing/expired token — send user to login) · `404` Not Found.
