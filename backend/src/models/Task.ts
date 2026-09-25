import { Schema, model, Document } from "mongoose";

export type TaskStatus = "todo" | "in-progress" | "done";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
  },
  {
    timestamps: true,
  }
);

export const Task = model<ITask>("Task", taskSchema);