import React, { useState } from "react";
import GameGrid from "./GameGrid";
import EcoTaskPage from "./EcoTaskPage";

export default function EcoChallenge() {
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <div className="min-h-screen bg-green-50 flex justify-center items-center">
      {selectedDay ? (
        <EcoTaskPage day={selectedDay} onBack={() => setSelectedDay(null)} />
      ) : (
        <GameGrid onOpenChallenge={setSelectedDay} />
      )}
    </div>
  );
}
