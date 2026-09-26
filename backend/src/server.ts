import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { connectRedis } from "./config/redis";
import { config } from "./config/config";
import tasksRouter from "./routes/taskRoutes";
import dotenv from "dotenv";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "TaskFlow Backend is running!" });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "taskflow-backend",
  });
});

// ---- API routes ----
app.use("/api/tasks", tasksRouter);

// ---- 404 catch-all ----
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// ---- Error middleware (MUST be last) ----
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[error]", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
);

const startServer = async () => {
  await connectDB();
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();