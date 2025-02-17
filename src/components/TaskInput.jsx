// TaskInput.jsx - Improved with validation and better error handling
import React, { useState } from "react";

const TaskInput = ({ onAddTask }) => {
    const [formData, setFormData] = useState({
        task: "",
        priority: "Low",
        status: "Todo",
        deadline: "",
    });
    const [error, setError] = useState("");

    const today = new Date().toISOString().split("T")[0];

    // Handle input changes dynamically
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleAddTask = () => {
        const { task, priority, status, deadline } = formData;

        // Validation
        if (!task.trim()) {
            setError("Task name cannot be empty");
            return;
        }

        if (!deadline) {
            setError("Please set a deadline");
            return;
        }

        if (new Date(deadline) < new Date(today)) {
            setError("Deadline cannot be earlier than today");
            return;
        }

        // Create new task object
        const newTask = {
            task,
            priority,
            status,
            deadline,
        };

        // Pass the new task to the parent component
        onAddTask(newTask);

        // Reset form fields
        setFormData({
            task: "",
            priority: "Low",
            status: "Todo",
            deadline: "",
        });
        setError("");
    };

    return (
        <div className="task-input-container">
            <h2>Add New Task</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="task-input">
                <div className="input-group">
                    <label htmlFor="task">Task Name:</label>
                    <input
                        id="task"
                        type="text"
                        name="task"
                        placeholder="Enter task name"
                        value={formData.task}
                        onChange={handleChange}
                        className="task-input-field"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="priority">Priority:</label>
                    <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="task-select"
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="status">Status:</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="task-select"
                    >
                        <option value="Todo">Todo</option>
                        <option value="Doing">Doing</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="deadline">Deadline:</label>
                    <input
                        id="deadline"
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        min={today}
                        className="task-input-field"
                    />
                </div>

                <button className="task-button" onClick={handleAddTask}>
                    Add Task
                </button>
            </div>
        </div>
    );
};

export default TaskInput;