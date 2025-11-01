import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    points: { type: Number, required: true },
    co2Saved: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    image: { type: Buffer }, // store image binary
    imageType: { type: String },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
});

// Virtual field for serving image as Base64 in frontend
activitySchema.virtual("imageSrc").get(function () {
    if (this.image && this.imageType) {
        return `data:${this.imageType};base64,${this.image.toString("base64")}`;
    }
});

export default mongoose.model("Activity", activitySchema);
