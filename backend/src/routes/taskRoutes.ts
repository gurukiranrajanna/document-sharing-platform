import { Router } from "express";
import {
  listTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController";

const router = Router();

router.get("/", listTasks);
router.get("/:id", (_req, res) => {
  res.sendStatus(501);
});
router.post("/", (_req, res) => {
  res.sendStatus(501);
});
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;