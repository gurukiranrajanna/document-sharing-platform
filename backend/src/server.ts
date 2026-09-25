import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "TaskFlow Backend is running!" });
});

app.get("/health", (_req, res) => {           // ← NEW
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "taskflow-backend",
  });
});

// 404 catch-all must come AFTER all routes
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();