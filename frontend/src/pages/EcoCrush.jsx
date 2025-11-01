import React, { useEffect, useRef, useState } from "react";
import "./EcoCrush.css";

export default function EcoCrush() {
  const totalDays = 31;
  const currentDay = 1; // first day unlocked
  const completedDays = currentDay - 1;
  const pathRef = useRef(null);
  const [positions, setPositions] = useState([]);
  const [showError, setShowError] = useState(false);

  // Animate vine drawing
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    setTimeout(() => {
      path.style.transition = "stroke-dashoffset 3s ease-in-out";
      path.style.strokeDashoffset = "0";
    }, 300);
  }, []);

  // Place day circles along the vine
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const totalLength = path.getTotalLength();
    const pts = [];

    for (let i = 0; i < totalDays; i++) {
      const pt = path.getPointAtLength((i / (totalDays - 1)) * totalLength);
      pts.push({ x: pt.x, y: pt.y });
    }

    setPositions(pts);
  }, []);

  const getStatus = (day) => {
    if (day <= completedDays) return "eco-completed";
    if (day === currentDay) return "eco-current";
    return "eco-locked";
  };

  const handleClaim = () => {
    if (currentDay < totalDays) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    } else {
      alert("🎁 Congratulations! You've claimed your EcoCrush Gift!");
    }
  };

  return (
    <div className="eco-bg">
      <div className="eco-overlay">
        <div className="eco-container">
          <h1 className="eco-title">EcoCrush – 30-Day Growth Path</h1>

          <div className="eco-snake-container">
            <svg
              className="eco-vine"
              viewBox="0 0 100 200"
              preserveAspectRatio="none"
            >
              <path
                ref={pathRef}
                d="
                  M 10 10 
                  Q 30 8, 50 12 
                  T 90 14 
                  Q 70 20, 50 25 
                  T 10 30 
                  Q 30 40, 60 45 
                  T 90 50 
                  Q 70 60, 40 65 
                  T 10 70 
                  Q 30 80, 60 85 
                  T 90 90 
                  Q 70 100, 40 110 
                  T 10 120
                "
              />
            </svg>

            {positions.map((pos, i) => {
              const day = i + 1;
              const status = getStatus(day);
              return (
                <div
                  key={day}
                  className={`eco-day ${status}`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}vh`,
                  }}
                >
                  <div className={`eco-circle ${status}`}>
                    <span className="eco-number">{day}</span>
                  </div>
                  <div className="eco-label">Day {day}</div>
                </div>
              );
            })}

            <button
              className={`eco-claim-btn ${
                currentDay === totalDays ? "eco-claim-active" : "eco-claim-locked"
              }`}
              onClick={handleClaim}
            >
              🎁 Claim Gift
            </button>

            {showError && (
              <div className="eco-error">
                ❌ Complete all 30 days to earn your reward!
              </div>
            )}
          </div>

          <div className="eco-info">
            <strong>{completedDays}</strong> / {totalDays} days completed
          </div>
        </div>
      </div>
    </div>
  );
}
