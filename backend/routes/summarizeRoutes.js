import dotenv from "dotenv";
import Groq from "groq-sdk";
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

dotenv.config();
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * POST /ask-eco
 * Ask an eco-related question and get an AI-generated answer
 */
router.post("/ask-eco", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || question.trim() === "") {
            return res.status(400).json({ response: "Please provide a valid question." });
        }

        // System message that limits scope to eco topics only 🌿
        const messages = [
            {
                role: "system",
                content: `
        You are EcoBot — an assistant that only answers eco-friendly and environmental questions.
        Topics you can answer include: sustainability, recycling, renewable energy, green living,
        climate change, eco-education, wildlife protection, and sustainable technologies.
        If a question is unrelated to eco or environmental issues, politely respond with:
        "I can only answer questions about eco-friendly and environmental topics. The answer should be consice and within 50 words."
        `
            },
            { role: "user", content: question }
        ];

        // Generate AI response using Groq’s model
        const response = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages,
            temperature: 0.6,
            max_tokens: 600,
            top_p: 1
        });

        const answer = response.choices[0]?.message?.content?.trim() || "No response generated.";
        return res.json({ response: answer });

    } catch (error) {
        console.error("❌ Error in /ask-eco route:", error);
        return res.status(500).json({ response: "An error occurred while processing your question." });
    }
});


export default router;
