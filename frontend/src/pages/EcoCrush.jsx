import React, { useState } from "react";
import EcoTaskPage from "./EcoTaskPage";
import ActivitiesPage from "./ActivitiesPage";
import GameGrid from "./GameGrid";

export default function EcoChallengeCalendar() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [page, setPage] = useState("calendar"); // calendar | task | activity

  const handleOpenChallenge = (day) => {
    setSelectedDay(day);
    setPage("task");
  };

  const handleBack = () => {
    setPage("calendar");
  };

  const handleCompleteTask = (task) => {
    setSelectedTask(task);
    setPage("activity");
  };

  const handleActivityDone = () => {
    setPage("calendar");
    setSelectedTask(null);
  };

  return (
    <>
      {page === "calendar" && <GameGrid onOpenChallenge={handleOpenChallenge} />}
      {page === "task" && (
        <EcoTaskPage
          day={selectedDay}
          onBack={handleBack}
          onCompleteTask={handleCompleteTask}
        />
      )}
      {page === "activity" && (
        <ActivitiesPage
          autoSelectedTask={selectedTask}
          onDone={handleActivityDone}
        />
      )}
    </>
  );
}
