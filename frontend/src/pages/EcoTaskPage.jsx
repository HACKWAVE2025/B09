import React, { useState } from "react";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import tasks from "./tasks";
import "../styles/EcoTaskPage.css";

export default function EcoTaskPage({ day, onBack }) {
  const [completed, setCompleted] = useState(() => {
    const done = JSON.parse(localStorage.getItem("ecoCompletedDays")) || [];
    return done.includes(day);
  });

  const todayTasks = tasks[day - 1] || ["No task assigned for this day"];

  const handleComplete = () => {
    const done = JSON.parse(localStorage.getItem("ecoCompletedDays")) || [];
    if (!done.includes(day)) {
      done.push(day);
      localStorage.setItem("ecoCompletedDays", JSON.stringify(done));
    }
    setCompleted(true);
  };

  return (
    <div className="eco-task-container">
      {/* Back Button */}
      <button className="eco-task-header" onClick={onBack}>
        <FaArrowLeft /> Back
      </button>

      {/* Day Heading */}
      <h2>🌍 Day {day} Challenge</h2>

      {/* Task List */}
      <ul className="eco-task-list">
        {todayTasks.map((task, i) => (
          <li key={i}>{task}</li>
        ))}
      </ul>

      {/* Complete Button */}
      <button
        className="eco-btn"
        onClick={handleComplete}
        disabled={completed}
      >
        {completed ? (
          <>
            <FaCheck className="inline mr-2" /> Completed
          </>
        ) : (
          "Mark as Completed"
        )}
      </button>
    </div>
  );
}
