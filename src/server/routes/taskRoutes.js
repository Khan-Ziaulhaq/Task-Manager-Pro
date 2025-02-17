import express from "express";
import Task from "../models/Task.js";
import { verifyToken } from "./authRoutes.js";

const router = express.Router();

// GET all tasks for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});

// CREATE a new task
router.post("/", verifyToken, async (req, res) => {
  try {
    const { task, priority, status, deadline } = req.body;
    
    const newTask = new Task({
      task,
      priority,
      status,
      deadline,
      userId: req.user.userId
    });
    
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
});

// UPDATE a task
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Verify ownership
    if (task.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      update,
      { new: true } // Return updated document
    );
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
});

// DELETE a task
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Verify ownership
    if (task.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }
    
    await Task.findByIdAndDelete(id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
});

export default router;