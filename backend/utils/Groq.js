import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function summarizeContent(content) {
    try {
        const response = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "user", content: `${content}` }
            ],
            temperature: 0.5,
            max_tokens: 500,
            top_p: 1,
        });

        return response.choices[0]?.message?.content || "Failed to summarize content.";
    } catch (error) {
        console.error("Error summarizing content:", error);
        throw new Error("Failed to summarize content.");
    }
}
