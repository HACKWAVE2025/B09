import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { FaLeaf } from "react-icons/fa";
import "../styles/DailyQuest.css";
import { ThemeContext } from "../context/ThemeContext";

const fixedDailyQuests = [
  { name: "Recycled Trash", id: 1 },
  { name: "Planted Tree", id: 2 },
];

const DailyQuest = () => {
  const { theme } = useContext(ThemeContext);
  const [completed, setCompleted] = useState([]);
  const [bonusGiven, setBonusGiven] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Fetch completed activities for today from backend
  useEffect(() => {
    const fetchTodayActivities = async () => {
      if (!user?.name) {
        console.warn("[DailyQuest] No user logged in, skipping fetch.");
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/activities/today/${encodeURIComponent(user.name)}`);
        const data = await res.json();

        console.log("[DailyQuest] Backend today activities response:", data);

        if (data.activities && Array.isArray(data.activities)) {
          // Normalize and clean up names for comparison
          const completedNames = data.activities.map((a) =>
            a.name ? a.name.trim().toLowerCase() : ""
          );
          setCompleted(completedNames);
          console.log("[DailyQuest] Completed (normalized):", completedNames);
        } else {
          console.warn("[DailyQuest] No valid activities array in response.");
        }
      } catch (err) {
        console.error("Failed to load today's activities:", err);
      }
    };

    fetchTodayActivities();
  }, [user]);

  // ✅ Auto award bonus points if both fixed tasks completed
  useEffect(() => {
    console.log("[DailyQuest] Checking bonus logic...");
    console.log("   - Fixed Quests:", fixedDailyQuests);
    console.log("   - Completed:", completed);

    const allCompleted = fixedDailyQuests.every((q) =>
      completed.includes(q.name.toLowerCase())
    );

    if (allCompleted && !bonusGiven) {
      awardBonusPoints();
      setBonusGiven(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  // ✅ Bonus API
  const awardBonusPoints = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name, bonusPoints: 100 }),
      });

      if (res.ok) {
        alert("🎉 Bonus 100 points added to your account!");
      } else {
        console.error("Bonus award failed:", await res.text());
      }
    } catch (err) {
      console.error("Error awarding bonus:", err);
    }
  };

  const isCompleted = (quest) => completed.includes(quest.name.toLowerCase());

  return (
    <div className={`daily-quest-page ${theme === "dark" ? "daily-dark" : "daily-light"}`}>
      <motion.div
        className="quest-container text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <FaLeaf className={`fs-1 mb-3 ${theme === "dark" ? "text-success" : "text-primary"}`} />
        <h2 className="fw-bold mb-3">Today's Eco Quests</h2>
        <p className="mb-4">Complete both eco-friendly actions to earn bonus points!</p>

        <ul className="list-group mb-4">
          {fixedDailyQuests.map((quest) => (
            <li
              key={quest.id}
              className={`list-group-item d-flex align-items-center ${isCompleted(quest) ? "completed-quest" : ""}`}
            >
              <input
                type="checkbox"
                className="form-check-input me-3"
                checked={isCompleted(quest)}
                readOnly
              />
              <span>{quest.name}</span>
            </li>
          ))}
        </ul>

        {fixedDailyQuests.every((q) => completed.includes(q.name.toLowerCase())) ? (
          <motion.p
            className="mt-3 text-success fw-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            🎉 You completed all daily quests! Bonus awarded.
          </motion.p>
        ) : (
          <p className={`mt-3 fw-semibold ${theme === "dark" ? "text-white" : "text-muted"}`}>
            ✅ Complete both to unlock your daily bonus!
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default DailyQuest;
