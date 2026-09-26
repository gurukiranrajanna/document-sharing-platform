# TaskFlow — Progress Log

Event-driven Task Manager built for Full Stack Engineer interview prep.
Stack: React + TS + Vite + Redux Toolkit (frontend), Node + Express + TS
(backend), MongoDB + Mongoose, Redis, Kafka, Docker Compose.

Repo root: `document-sharing-platform/`
Compose project name: `taskflow`
Container names: `taskflow-mongo-1`, `taskflow-redis-1`, `taskflow-kafka-1`

---

## Step 0 — Scaffolding ✅
- Monorepo structure: `backend/`, `frontend/` (frontend still empty)
- Root `README.md` (placeholder)
- Root `.gitignore` covering node_modules, .env, dist, scratch files
- Git initialized at root (`main` branch)

---

## Step 1 — Docker Compose infra ✅
- `docker-compose.yml` at root with:
  - `mongo:7` → port 27017, named volume `mongo-data`, healthcheck via mongosh ping
  - `redis:7-alpine` → port 6379, healthcheck via redis-cli ping
  - `apache/kafka:3.9.0` → port 9092, KRaft mode (no ZooKeeper), healthcheck via kafka-topics.sh
- Top-level `name: taskflow` sets Compose project name
- Verified: `mongosh ping { ok: 1 }`, `redis PING`, `kafka --list` (empty, no error)
- Lessons:
  - Bitnami Kafka images were removed from Docker Hub (Aug 2025) → use `apache/kafka` with simpler env vars (no `CFG_` prefix)
  - `container_name:` on Docker Desktop 4.92 caused "must be a mapping" error → removed it, used top-level `name:` instead
  - Docker Compose enforces block-style YAML for ports/volumes on newer versions — avoid inline `["x:y"]` syntax
  - `KAFKA_ADVERTISED_LISTENERS=localhost:9092` because backend runs on host; switch to `kafka:9092` when backend runs in Docker (Step 7)

---

## Step 2 — Backend bootstrap ✅
- `backend/src/server.ts`: Express app, `cors`, `express.json`, listens on port 4000 (from `.env`, fallback 4000)
- `backend/src/config/db.ts`: Mongoose connects via `MONGO_URI` (default `mongodb://localhost:27017/taskflow`)
- Routes:
  - `GET /` → `{ message: "TaskFlow Backend is running!" }`
  - `GET /health` → `{ status, uptime, timestamp, service }`
  - 404 catch-all → `{ message: "Not found" }`
- Verified all three endpoints via `curl.exe`
- Lessons:
  - Env vars are case-sensitive; `PORT` must be set in `.env`
  - Express routes match top-to-bottom; 404 catch-all MUST be last
  - In PowerShell, `curl` is aliased to `Invoke-WebRequest` — use `curl.exe` for real curl

---

## Step 3 — Task model + CRUD ✅

### 3a — Model (`backend/src/models/Task.ts`)
- Lean schema: `title` (required, trimmed, max 200), `description?` (trimmed, default ""), `status` (enum: `todo | in-progress | done`, default `todo`)
- `{ timestamps: true }` → auto `createdAt`, `updatedAt`
- Exported `ITask` interface and `Task` model
- Collection name: `tasks` (Mongoose pluralizes model name)

### 3b — Controller (`backend/src/controllers/taskController.ts`)
- 5 handlers: `listTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask`
- All wrapped in try/catch → `next(err)`
- `listTasks` sorts by `createdAt: -1`
- `updateTask` uses `{ new: true, runValidators: true }`
- DELETE returns 204 No Content

### 3c — Routes (`backend/src/routes/taskRoutes.ts`)
- `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`

### 3d — Wire-up (`backend/src/server.ts`)
- Mounted `app.use("/api/tasks", tasksRouter)`
- Error middleware with 4-arg signature, registered LAST:
  - `ValidationError` → 400
  - `CastError` → 400 (`Invalid {path}: {value}`)
  - otherwise → 500 `{ message: "Internal Server Error" }`
- 404 catch-all sits between routes and error middleware

### 3e — Verified via `curl.exe`
- Full CRUD verified: 200/201/204/400/404 as expected
- Test cases: invalid ObjectId → 400 CastError, unknown valid ID → 404, invalid enum → 400 ValidationError, missing title → 400

### Lessons from Step 3
- Error middleware MUST have 4 arguments and be registered LAST
- `findByIdAndUpdate` needs `{ new: true, runValidators: true }`
- Express 4 doesn't auto-catch async rejections → try/catch → `next(err)`
- Mongoose queries can hang if the underlying connection goes stale after Docker restarts → restart backend. Production fix: `serverSelectionTimeoutMS` + connection event listeners
- Use `-d @file.json` in curl to avoid PowerShell quoting hell

---

## Step 4 — Redis caching on GET /api/tasks ✅

### 4a — Config refactor ✅
- `backend/src/config/config.ts` — centralized env vars
- `db.ts` and `server.ts` use `config` instead of reading `process.env` inline

### 4b — Redis client ✅
- `backend/src/config/redis.ts` — `redisClient` singleton + `connectRedis()`
- `on("error")` listener (node-redis v4 crashes without it)
- `[redis] connected` logged on startup, `connectRedis()` called after `connectDB()`

### 4c — Cache-aside logic ✅
- `listTasks`: cache-first → HIT returns `{source:"cache", data}`, MISS reads Mongo with `.lean()`, sets with `EX: 60`, returns `{source:"db", data}`
- `createTask` / `updateTask` / `deleteTask`: `redisClient.del(CACHE_KEY)` after DB write
- Fixed bug: `updateTask` / `deleteTask` originally didn't invalidate; added
- Fixed bug: `taskRoutes.ts` had stub handlers returning 501 for `GET /:id` and `POST /`; wired real `getTask` and `createTask`

### Verified end-to-end