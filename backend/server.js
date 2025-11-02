import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import summarizeRoutes from "./routes/summarizeRoutes.js";
import User from "./models/User.js"; // ✅ Import your User model

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// 🧾 Logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
});

// ✅ Base API check
app.get("/", (req, res) => {
  res.send("🌱 Gamified Carbon Tracker API is running");
});

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/summarize", summarizeRoutes);

// ✅ New route: Get today's activities for a specific user
app.get("/api/activities/today/:name", async (req, res) => {
  try {
    const { name } = req.params;

    // Find user by name
    const user = await User.findOne({ name });
    if (!user) {
      console.warn(`⚠️ User not found: ${name}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Get today's date and filter calendar
    const today = new Date();
    const todayActivities = user.calendar.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getDate() === today.getDate() &&
        entryDate.getMonth() === today.getMonth() &&
        entryDate.getFullYear() === today.getFullYear()
      );
    });

    console.log(`✅ Found ${todayActivities.length} activities for ${name}`);
    res.json({ activities: todayActivities });
  } catch (err) {
    console.error("❌ Error fetching today's activities:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ⚠️ 404 handler (keep this LAST)
app.use((req, res) => {
  console.log("⚠️ Invalid route accessed:", req.url);
  res.status(404).json({ message: "Route not found" });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
