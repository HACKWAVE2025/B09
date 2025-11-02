import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import crypto from "crypto";
import Activity from "../models/Activity.js";
import User from "../models/User.js";
import Badge from "../models/Badge.js";

const router = express.Router();

// ⚙️ Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔐 Helper for image hashing
const generateImageHash = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

// ========================================================
// ✅ POST /api/activities — Add new activity
// ========================================================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let { name, type, points, co2Saved, latitude, longitude } = req.body;
    points = Number(points);
    co2Saved = Number(co2Saved);

    if (!name || !type || isNaN(points) || isNaN(co2Saved)) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ name }).populate("badges");
    if (!user) return res.status(404).json({ message: "User not found" });

    let imageHash = null;
    if (req.file) {
      imageHash = generateImageHash(req.file.buffer);
      const duplicate = await Activity.findOne({ user: user._id, imageHash });
      if (duplicate)
        return res.status(409).json({ message: "Duplicate image detected" });
    }

    const activityData = {
      user: user._id,
      type,
      points,
      co2Saved,
      uploadedAt: new Date(),
      location: {
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      },
      imageHash,
    };

    if (req.file) {
      activityData.image = req.file.buffer;
      activityData.imageType = req.file.mimetype;
    }

    const activity = await Activity.create(activityData);

    // Update user stats
    user.points += points;
    user.calendar.push({
      activityType: type, // <---- consistent naming
      pointsEarned: points,
      co2Saved,
      date: new Date(),
    });

    // Award badges
    const allBadges = await Badge.find();
    const newBadges = [];
    for (const badge of allBadges) {
      const alreadyEarned = user.badges.some((b) =>
        new mongoose.Types.ObjectId(b._id || b).equals(badge._id)
      );
      if (!alreadyEarned && user.points >= badge.threshold) {
        user.badges.push(badge._id);
        newBadges.push(badge);
      }
    }

    await user.save();

    res.status(201).json({
      message: "Activity added successfully",
      activity: {
        ...activity.toObject(),
        imageSrc: activity.image
          ? `data:${activity.imageType};base64,${activity.image.toString("base64")}`
          : null,
      },
      calendar: user.calendar,
    });
  } catch (err) {
    console.error("❌ Error adding activity:", err);
    res.status(500).json({ message: err.message });
  }
});

// ========================================================
// ✅ GET /api/activities/today/:name — Get today's activities
// ========================================================
router.get("/today/:name", async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`🕒 Fetching today's activities for ${name}`);

    const user = await User.findOne({ name });
    if (!user) {
      console.log("❌ User not found for", name);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.calendar || user.calendar.length === 0) {
      console.log("ℹ️ No calendar entries found for", name);
      return res.json({ activities: [] });
    }

    const today = new Date();
    const todayActivities = user.calendar.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getDate() === today.getDate() &&
        entryDate.getMonth() === today.getMonth() &&
        entryDate.getFullYear() === today.getFullYear()
      );
    });

    console.log("📅 Raw todayActivities:", todayActivities);

    const formatted = todayActivities.map((a) => ({
      name: a.activityType || a.type || "Unknown",
      pointsEarned: a.pointsEarned ?? 0,
      co2Saved: a.co2Saved ?? 0,
      date: a.date,
    }));

    console.log("✅ Sending formatted todayActivities:", formatted);

    res.json({ activities: formatted });
  } catch (err) {
    console.error("🔥 Error in /today route:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ========================================================
// ✅ POST /api/activities/user — Fetch all user activities
// ========================================================
router.post("/user", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ message: "User not found" });

    const activities = await Activity.find({ user: user._id }).sort({ date: -1 });
    const formatted = activities.map((a) => ({
      ...a.toObject(),
      imageSrc: a.image
        ? `data:${a.imageType};base64,${a.image.toString("base64")}`
        : null,
    }));

    res.json({ activities: formatted, badges: user.badges });
  } catch (err) {
    console.error("❌ Error fetching user activities:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
