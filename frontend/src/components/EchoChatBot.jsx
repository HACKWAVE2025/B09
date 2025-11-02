import React, { useState } from "react";
import { FaComments, FaTimes, FaPaperPlane } from "react-icons/fa";
import "../styles/EcoChatBot.css";

const EcoChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "bot", text: "🌿 Hi there! I'm EcoBot. Ask me anything about eco-friendly living!" },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/summarize/ask-eco", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: input }),
            });

            const data = await response.json();

            const botMessage = {
                sender: "bot",
                text: data.response || "Sorry, I couldn't understand that.",
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "⚠️ There was an error connecting to the server." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button className="chat-toggle-btn" onClick={toggleChat}>
                {isOpen ? <FaTimes size={20} /> : <FaComments size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <h4>EcoBot 🪴</h4>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {loading && <div className="bot-msg">🤖 Thinking...</div>}
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder="Ask something eco-friendly..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button onClick={sendMessage}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default EcoChatBot;
