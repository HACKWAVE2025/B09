import express from "express";
import { summarizeContent } from "../utils/Groq.js"; // add .js
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { activities, name } = req.body;

        if (!activities || activities.length === 0)
            return res.status(400).json({ message: "No activities provided" });

        const content = activities
            .map(act => `${act.activityType} (${act.pointsEarned} pts, CO2 saved: ${act.co2Saved} kg)`)
            .join(". ");

        // include user's name in the prompt
        const prompt = `Summarize these events for ${name} and make it into an eco-friendly story within 100 words: ${content}`;

        const summary = await summarizeContent(prompt);

        res.json({ summary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to summarize activities." });
    }
});

export default router;
