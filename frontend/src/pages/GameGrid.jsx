import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaLock, FaCheckCircle } from "react-icons/fa";
import "../styles/GameGrid.css";

export default function GameGrid({ onOpenChallenge }) {
    const daysInMonth = 30;
    const today = new Date().getDate();
    const monthName = new Date().toLocaleString("default", { month: "long" });

    const [completedDays, setCompletedDays] = useState(() => {
        return JSON.parse(localStorage.getItem("ecoCompletedDays")) || [];
    });

    const handleDayClick = (day) => {
        if (day > today) return;
        onOpenChallenge(day);
    };

    return (
        <div className="calendar-container">
            <h2>🌿 {monthName} Eco Challenge</h2>

            <div className="grid">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const isLocked = day > today;
                    const isComplete = completedDays.includes(day);

                    return (
                        <motion.div
                            key={day}
                            className={`day-tile ${isLocked ? "locked" : ""} ${isComplete ? "completed" : ""
                                }`}
                            whileTap={!isLocked ? { scale: 0.95 } : {}}
                            onClick={() => handleDayClick(day)}
                        >
                            {isLocked ? (
                                <FaLock />
                            ) : isComplete ? (
                                <FaCheckCircle />
                            ) : (
                                day
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <p>Click a day to view your eco tasks. Future days are locked 🔒.</p>
        </div>
    );
}
