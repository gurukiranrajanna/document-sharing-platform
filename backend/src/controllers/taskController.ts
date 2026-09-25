import { RequestHandler } from "express";
import { ITask, Task } from "../models/Task";

export const listTasks: RequestHandler = async (_req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
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
    const task = await Task.create(req.body as ITask);
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
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};
