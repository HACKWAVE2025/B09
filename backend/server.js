import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import summarizeRoutes from "./routes/summarizeRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
});

app.get("/", (req, res) => {
  res.send("🌱 Gamified Carbon Tracker API is running");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/summarize", summarizeRoutes);

// 404 handler
app.use((req, res) => {
  console.log("⚠️ Invalid route accessed:", req.url);
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
