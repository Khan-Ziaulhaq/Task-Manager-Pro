import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = 5500;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/auth", authRoutes); // ✅ Authentication routes
app.use("/api/tasks", taskRoutes); // ✅ Task management routes

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

