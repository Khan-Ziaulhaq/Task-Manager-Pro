import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  task: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, default: "Todo" },
  deadline: { type: Date, required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
});

const Task = mongoose.model("Task", taskSchema);

export default Task;