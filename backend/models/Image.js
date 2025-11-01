import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  email: { type: String, required: true },
  imageHash: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// 🚀 Enforce uniqueness per user per image hash
imageSchema.index({ email: 1, imageHash: 1 }, { unique: true });

export default mongoose.model("Image", imageSchema);
