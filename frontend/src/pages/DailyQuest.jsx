import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { FaLeaf } from "react-icons/fa";
import "../styles/DailyQuest.css";
import { ThemeContext } from "../context/ThemeContext";

const allActivities = [
  { name: "Recycled Trash", id: 1 },
  { name: "Planted Tree", id: 2 },
  { name: "Boarded Public Transport", id: 3 },
  { name: "Saved Electricity", id: 4 },
  { name: "Used Bicycle", id: 5 },
];

const DailyQuest = () => {
  const { theme } = useContext(ThemeContext);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [bonusGiven, setBonusGiven] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const today = new Date().toDateString();
    const storedData = JSON.parse(localStorage.getItem("dailyQuestsData") || "{}");

    // ✅ Always reset if old date OR wrong number of quests
    if (
      !storedData.date ||
      storedData.date !== today ||
      !Array.isArray(storedData.quests) ||
      storedData.quests.length !== 2
    ) {
      const shuffled = [...allActivities].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 2); // Always pick exactly 2
      setDailyQuests(selected);
      localStorage.setItem("dailyQuestsData", JSON.stringify({ date: today, quests: selected }));
    } else {
      setDailyQuests(storedData.quests);
    }
  }, []);

  // Load completed tasks
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("completedActivities") || "[]");
    setCompleted(stored);
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem("completedActivities") || "[]");
      setCompleted(updated);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Auto award bonus
  useEffect(() => {
    if (dailyQuests.length === 2) {
      const completedToday = dailyQuests.filter((q) => completed.includes(q.name));
      if (completedToday.length === 2 && !bonusGiven) {
        awardBonusPoints();
        setBonusGiven(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, dailyQuests]);

  const awardBonusPoints = async () => {
    try {
      const res = await fetch("https://b09-backend.onrender.com/api/bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          bonusPoints: 100,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("🎉 Bonus 100 points added to your account!");
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error("Error awarding bonus:", err);
    }
  };

  const isCompleted = (quest) => completed.includes(quest.name);

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
        <p className="mb-4">Complete today’s 2 eco-friendly actions to earn bonus points!</p>

        <ul className="list-group mb-4">
          {dailyQuests.map((quest) => (
            <li
              key={quest.id}
              className={`list-group-item d-flex align-items-center ${
                isCompleted(quest) ? "completed-quest" : ""
              }`}
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

        {dailyQuests.length > 0 && (
          <>
            {dailyQuests.filter((q) => completed.includes(q.name)).length < 2 ? (
              <p className={`mt-3 fw-semibold ${theme === "dark" ? "text-white" : "text-muted"}`}>
                ✅ Complete all 2 to unlock your daily bonus!
              </p>
            ) : (
              <motion.p
                className="mt-3 text-success fw-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                🎉 You completed all daily quests! Bonus awarded.
              </motion.p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DailyQuest;
