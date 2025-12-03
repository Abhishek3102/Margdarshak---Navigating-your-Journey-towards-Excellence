const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import route files
const userRoutes = require("./Routes/userRoutes");
const recommendationRoutes = require("./Routes/recommendationRoutes");
const feedbackRoutes = require("./Routes/feedbackRoutes");
const authRoutes = require("./Routes/authRoutes");
const courseRoutes = require("./Routes/courseRoutes");

require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes); // Authentication routes (login, register, etc.)
app.use("/api/users", userRoutes); // User profile and settings routes
app.use("/api/recommendations", recommendationRoutes); // Course recommendation routes
app.use("/api/feedback", feedbackRoutes); // Course and platform feedback routes
app.use("/api/courses", courseRoutes); // Course listing, details, and enrollment routes

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((err) => console.error(err));

// Start server
app.listen(3001, () => {
  console.log("Server running on port 3001");
});
