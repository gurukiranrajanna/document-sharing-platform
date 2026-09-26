import { RequestHandler } from "express";
import { ITask, Task } from "../models/Task";
import { redisClient } from "../config/redis";
import { config } from "../config/config";

const CACHE_KEY = "tasks:list";

export const listTasks: RequestHandler = async (_req, res, next) => {
  try {
    const cached = await redisClient.get(CACHE_KEY);
    if (cached) {
      res.json({ source: "cache", data: JSON.parse(cached) });
      return;
    }

    const tasks = await Task.find().sort({ createdAt: -1 }).lean();

    await redisClient.set(CACHE_KEY, JSON.stringify(tasks), {
      EX: config.cacheTtlSeconds,
    });

    res.json({ source: "db", data: tasks });
  } catch (err) {
    next(err);
  }
};

export const getTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const createTask: RequestHandler = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const task = await Task.create({ title, description });

    await redisClient.del(CACHE_KEY);

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body as ITask, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await redisClient.del(CACHE_KEY);

    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await redisClient.del(CACHE_KEY);

    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};