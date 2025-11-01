import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  points: { type: Number, required: true },
  co2Saved: { type: Number, required: true },

  // Existing fields
  date: { type: Date, default: Date.now },
  image: { type: Buffer }, // Binary image data
  imageType: { type: String },

  // 🌍 Location info (optional)
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },

  // 🆕 For duplicate prevention
  imageHash: { type: String, required: true }, // Unique hash of image content

  // 🕒 For authenticity/auditing
  uploadedAt: { type: Date, default: Date.now },
});

// Virtual field for serving image as Base64 to frontend
activitySchema.virtual("imageSrc").get(function () {
  if (this.image && this.imageType) {
    return `data:${this.imageType};base64,${this.image.toString("base64")}`;
  }
  return null;
});

// Index for quick duplicate detection
activitySchema.index({ user: 1, imageHash: 1 }, { unique: true });

export default mongoose.model("Activity", activitySchema);
