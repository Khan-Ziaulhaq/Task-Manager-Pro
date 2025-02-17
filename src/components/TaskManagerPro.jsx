// TaskManagerPro.jsx - Fix fetch and state management
import React, { useState, useEffect } from "react";
import TaskInput from "./TaskInput";
import TaskSection from "./TaskSection";
import { useNavigate } from "react-router-dom";

const TaskManagerPro = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch tasks on component mount using useEffect
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
    
        if (!token) {
          navigate("/login");
          return;
        }
    
        const response = await fetch("http://localhost:5500/api/tasks", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, []); // Empty dependency array means this runs once on mount

  // Add a new task
  const handleAddTask = async (taskData) => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        navigate("/login");
        return;
      }
  
      const response = await fetch("http://localhost:5500/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const newTask = await response.json();
      setTasks(prevTasks => [...prevTasks, newTask]);
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Failed to create task. Please try again.");
    }
  };
  
  // Update a task
  const updateTask = async (id, updatedTask) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await fetch(`http://localhost:5500/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTask),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setTasks(tasks.map((task) => (task._id === id ? data : task)));
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task. Please try again.");
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await fetch(`http://localhost:5500/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="task-manager">
      <header className="app-header">
        <h1 className="title">TaskManager Pro</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      <TaskInput onAddTask={handleAddTask} />

      <div className="task-sections">
        {["Todo", "Doing", "Completed"].map((section) => (
          <TaskSection
            key={section}
            section={section}
            tasks={tasks}
            updateTask={updateTask}
            deleteTask={deleteTask}
            setTasks={setTasks}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskManagerPro;