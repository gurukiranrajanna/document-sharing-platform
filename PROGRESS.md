## Step 2 — Backend bootstrap ✅
- Express + TS + cors + dotenv
- src/server.ts: app listens on port 4000 (from .env, fallback 4000)
- src/config/db.ts: mongoose connects via MONGO_URI (localhost:27017/taskflow)
- Routes:
  - GET /         → { message: "TaskFlow Backend is running!" }
  - GET /health   → { status, uptime, timestamp, service }
  - 404 catch-all → { message: "Not found" }
- Verified via curl.exe — all 3 endpoints respond correctly
- Lessons:
  - Env vars are case-sensitive; PORT must be set in .env or fallback kicks in
  - Express routes match top-to-bottom; 404 catch-all MUST be last

## Next: Step 3 — Task model + CRUD routes