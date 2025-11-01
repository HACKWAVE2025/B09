import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import crypto from "crypto"; // ✅ for hashing
import Activity from "../models/Activity.js";
import User from "../models/User.js";
import Badge from "../models/Badge.js";

const router = express.Router();

// Configure multer (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Helper function to generate image hash
const generateImageHash = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

// ✅ Add Activity Endpoint with Geolocation, Timestamp, and Duplicate Check
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let { name, type, points, co2Saved, latitude, longitude } = req.body;
    points = Number(points);
    co2Saved = Number(co2Saved);

    if (!name || !type || isNaN(points) || isNaN(co2Saved)) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ name }).populate("badges");
    if (!user) return res.status(400).json({ message: "User not found" });

    // ===== Duplicate Image Detection =====
    let imageHash = null;
    if (req.file) {
      imageHash = generateImageHash(req.file.buffer);
      console.log("🧩 Generated Image Hash:", imageHash);

      // Check for existing duplicate
      const duplicate = await Activity.findOne({
        user: user._id,
        imageHash,
      });

      if (duplicate) {
        console.warn("⚠️ Duplicate image detected for user:", name);
        return res.status(409).json({
          message: "Duplicate image detected. Please upload a different photo.",
        });
      }
    }

    // ===== Create activity object =====
    const activityData = {
      user: user._id,
      type,
      points,
      co2Saved,
      uploadedAt: new Date(), // ✅ precise upload timestamp
      location: {
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      },
    };

    if (req.file) {
      activityData.image = req.file.buffer;
      activityData.imageType = req.file.mimetype;
      activityData.imageHash = imageHash; // ✅ store image hash for future checks
    }

    console.log("📸 Activity data ready to be saved:", {
      name,
      type,
      points,
      co2Saved,
      latitude,
      longitude,
      uploadedAt: activityData.uploadedAt,
      hasImage: !!req.file,
    });

    const activity = await Activity.create(activityData);

    // ===== Update user stats =====
    user.points += points;
    user.calendar.push({
      activityType: type,
      pointsEarned: points,
      co2Saved,
      date: new Date(),
    });

    // ===== Badge logic =====
    const allBadgesDocs = await Badge.find();
    const newBadges = [];

    for (const badge of allBadgesDocs) {
      const alreadyEarned = user.badges.some((b) =>
        new mongoose.Types.ObjectId(b._id || b).equals(badge._id)
      );
      if (!alreadyEarned && user.points >= badge.threshold) {
        user.badges.push(badge._id);
        newBadges.push(badge);
      }
    }

    await user.save();
    const populatedUser = await user.populate("badges");

    console.log("✅ Activity saved successfully for:", name);

    res.status(201).json({
      message: "Activity added successfully",
      activity: {
        ...activity.toObject(),
        imageSrc: activity.image
          ? `data:${activity.imageType};base64,${activity.image.toString("base64")}`
          : null,
      },
      newBadges: newBadges.map((b) => ({
        name: b.name,
        icon: b.icon,
        threshold: b.threshold,
      })),
      allBadges: populatedUser.badges.map((b) => ({
        name: b.name,
        icon: b.icon,
        threshold: b.threshold,
      })),
      calendar: user.calendar,
    });
  } catch (error) {
    console.error("❌ Error adding activity:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get all activities of a user
router.post("/user", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const user = await User.findOne({ name });
    if (!user) return res.status(400).json({ message: "User not found" });

    const activities = await Activity.find({ user: user._id }).sort({ date: -1 });
    const formattedActivities = activities.map((a) => ({
      ...a.toObject(),
      imageSrc: a.image
        ? `data:${a.imageType};base64,${a.image.toString("base64")}`
        : null,
    }));

    res.json({ activities: formattedActivities, badges: user.badges });
  } catch (err) {
    console.error("❌ Error fetching user activities:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
