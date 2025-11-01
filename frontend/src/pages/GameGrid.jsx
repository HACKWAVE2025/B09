import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaLock, FaCheckCircle, FaLeaf } from "react-icons/fa";
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
        <div className="map-container">
            <h2 className="map-title">🍃 {monthName} Eco Adventure</h2>
            <div className="map-scroll">
                <svg className="path-line" width="100%" height="1800">
                    <path
                        d="M 50 50 Q 150 150 50 250 Q -50 350 50 450 Q 150 550 50 650 Q -50 750 50 850 Q 150 950 50 1050 Q -50 1150 50 1250 Q 150 1350 50 1450 Q -50 1550 50 1650"
                        stroke="#81c784"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>

                <div className="levels">
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const isLocked = day > today;
                        const isComplete = completedDays.includes(day);

                        // Zigzag positioning for levels (alternating left/right)
                        const positionStyle = {
                            left: `${day % 2 === 0 ? 65 : 15}%`,
                            top: `${i * 55 + 50}px`,
                        };

                        return (
                            <motion.div
                                key={day}
                                className={`level-node ${isLocked ? "locked" : ""} ${isComplete ? "completed" : ""}`}
                                style={positionStyle}
                                whileTap={!isLocked ? { scale: 0.9 } : {}}
                                onClick={() => handleDayClick(day)}
                            >
                                {isLocked ? (
                                    <FaLock className="icon" />
                                ) : isComplete ? (
                                    <FaCheckCircle className="icon" />
                                ) : (
                                    <>
                                        <FaLeaf className="icon leaf" />
                                        <span className="day-num">{day}</span>
                                    </>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
