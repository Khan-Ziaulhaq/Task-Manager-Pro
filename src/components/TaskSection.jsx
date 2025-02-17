// TaskSection.jsx - Fixed with proper drag and drop, error handling
import React, { useState } from "react";
import { format, isBefore, differenceInDays } from "date-fns";

const TaskSection = ({ section, tasks, updateTask, deleteTask, setTasks }) => {
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedTask, setEditedTask] = useState({
        task: "",
        priority: "Low",
        deadline: "",
    });
    const [error, setError] = useState("");

    // Handle drag events
    const handleDragStart = (taskId) => {
        return (e) => {
            e.dataTransfer.setData("taskId", taskId);
            // Add a visual effect for dragging
            e.target.classList.add("dragging");
        };
    };

    const handleDragEnd = (e) => {
        // Remove visual effect
        e.target.classList.remove("dragging");
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        // Add visual indicator for drop zone
        e.currentTarget.classList.add("drag-over");
    };

    const handleDragLeave = (e) => {
        // Remove visual indicator
        e.currentTarget.classList.remove("drag-over");
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("drag-over");
        
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) {
            try {
                await updateTaskSection(taskId, section);
            } catch (err) {
                setError(`Failed to move task: ${err.message}`);
                setTimeout(() => setError(""), 3000);
            }
        }
    };

    const updateTaskSection = async (taskId, newSection) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication required");

            const response = await fetch(`http://localhost:5500/api/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newSection }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const updatedTask = await response.json();
            setTasks((prev) =>
                prev.map((task) =>
                    task._id === taskId ? updatedTask : task
                )
            );
        } catch (error) {
            console.error("Error updating task status:", error);
            throw error;
        }
    };

    // Handle edit task inputs
    const handleEditClick = (task) => {
        setEditingTaskId(task._id);
        setEditedTask({
            task: task.task,
            priority: task.priority,
            deadline: new Date(task.deadline).toISOString().split("T")[0],
            status: task.status
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedTask((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = async (task) => {
        try {
            // Validate edited data
            if (!editedTask.task.trim()) {
                setError("Task name cannot be empty");
                return;
            }

            if (!editedTask.deadline) {
                setError("Please set a deadline");
                return;
            }

            await updateTask(task._id, { ...task, ...editedTask });
            setEditingTaskId(null);
            setError("");
        } catch (err) {
            setError(`Failed to save changes: ${err.message}`);
        }
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setError("");
    };

    const getPriorityColor = (priority) => {
        return {
            Low: "priority-low",
            Medium: "priority-medium",
            High: "priority-high",
        }[priority] || "";
    };

    const getDeadlineColor = (deadline) => {
        const currentDate = new Date();
        const deadlineDate = new Date(deadline);

        if (isBefore(deadlineDate, currentDate)) return "deadline-passed";

        const daysLeft = differenceInDays(deadlineDate, currentDate);
        return daysLeft <= 2 ? "deadline-close" : "";
    };

    const handleDeleteConfirm = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await deleteTask(taskId);
            } catch (err) {
                setError(`Failed to delete task: ${err.message}`);
                setTimeout(() => setError(""), 3000);
            }
        }
    };

    // Filter tasks belonging to this section
    const sectionTasks = (tasks || []).filter((task) => task.status === section);

    return (
        <div
            className={`task-section ${section.toLowerCase()}-section`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <h2 className="section-title">{section}</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            {sectionTasks.length === 0 ? (
                <div className="no-tasks-message">No tasks in this section</div>
            ) : (
                sectionTasks.map((task) => (
                    <div
                        key={task._id}
                        draggable
                        onDragStart={handleDragStart(task._id)}
                        onDragEnd={handleDragEnd}
                        className={`task-card ${getDeadlineColor(task.deadline)}`}
                    >
                        {editingTaskId === task._id ? (
                            <div className="edit-task-form">
                                <input
                                    type="text"
                                    name="task"
                                    value={editedTask.task}
                                    onChange={handleEditChange}
                                    className="edit-task-input-field"
                                />
                                <div className="edit-task-details">
                                    <select
                                        name="priority"
                                        value={editedTask.priority}
                                        onChange={handleEditChange}
                                        className="edit-task-select"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={editedTask.deadline}
                                        onChange={handleEditChange}
                                        className="edit-task-input-field"
                                    />
                                </div>
                                <div className="edit-task-actions">
                                    <button
                                        className="save-button"
                                        onClick={() => handleSaveClick(task)}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="cancel-button"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="task-name">{task.task}</p>
                                <div className="task-details">
                                    <p className={`task-priority ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </p>
                                    <p className="task-deadline">
                                        {format(new Date(task.deadline), "dd/MM/yyyy")}
                                    </p>
                                </div>
                                <div className="task-actions">
                                    <button
                                        className="edit-button"
                                        onClick={() => handleEditClick(task)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteConfirm(task._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default TaskSection;