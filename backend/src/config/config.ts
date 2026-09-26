
import dotenv from "dotenv";
dotenv.config();  // ← FIRST, before anything else uses config

import express from "express";
import cors from "cors";

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/taskflow",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  cacheTtlSeconds: 60,
  nodeEnv: process.env.NODE_ENV || "development",
};