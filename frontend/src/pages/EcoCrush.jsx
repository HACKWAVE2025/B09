import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/EcoCrush.css"

// 🌿 Eco icons (you can replace with your own SVGs or images)
const ecoItems = ["🌳", "🚲", "🔋", "♻️", "☀️"];

const GRID_SIZE = 7;

const EcoCrush = () => {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  // 🧩 Initialize board
  useEffect(() => {
    setGrid(generateBoard());
  }, []);

  // 🔄 Generate random eco board
  const generateBoard = () => {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      newGrid.push(randomItem());
    }
    return newGrid;
  };

  const randomItem = () => ecoItems[Math.floor(Math.random() * ecoItems.length)];

  // 🖱 Handle tile click
  const handleClick = (index) => {
    if (selected === null) {
      setSelected(index);
      return;
    }

    if (isAdjacent(selected, index)) {
      swapItems(selected, index);
      setMoves((m) => m - 1);
    }
    setSelected(null);
  };

  const isAdjacent = (i1, i2) => {
    const row1 = Math.floor(i1 / GRID_SIZE);
    const col1 = i1 % GRID_SIZE;
    const row2 = Math.floor(i2 / GRID_SIZE);
    const col2 = i2 % GRID_SIZE;
    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  };

  const swapItems = (i1, i2) => {
    const newGrid = [...grid];
    [newGrid[i1], newGrid[i2]] = [newGrid[i2], newGrid[i1]];
    setGrid(newGrid);
    checkMatches(newGrid);
  };

  // 🎯 Check for matches
  const checkMatches = (currentGrid) => {
    const matched = new Set();

    // Row matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const start = row * GRID_SIZE + col;
        const item = currentGrid[start];
        if (item && item === currentGrid[start + 1] && item === currentGrid[start + 2]) {
          matched.add(start);
          matched.add(start + 1);
          matched.add(start + 2);
        }
      }
    }

    // Column matches
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const start = row * GRID_SIZE + col;
        const item = currentGrid[start];
        if (item && item === currentGrid[start + GRID_SIZE] && item === currentGrid[start + GRID_SIZE * 2]) {
          matched.add(start);
          matched.add(start + GRID_SIZE);
          matched.add(start + GRID_SIZE * 2);
        }
      }
    }

    if (matched.size > 0) {
      handleMatch(matched, currentGrid);
    }
  };

  const handleMatch = (matched, currentGrid) => {
    const newGrid = [...currentGrid];
    matched.forEach((index) => (newGrid[index] = null));
    const pointsEarned = matched.size * 10;

    setScore((s) => s + pointsEarned);
    setMessage(`+${pointsEarned} eco points 🌿`);
    setTimeout(() => setMessage(""), 1000);

    // Drop new tiles
    const dropped = dropTiles(newGrid);
    setTimeout(() => {
      setGrid(dropped);
      checkMatches(dropped);
    }, 300);
  };

  // 🌧️ Drop tiles down when cleared
  const dropTiles = (grid) => {
    const newGrid = [...grid];
    for (let col = 0; col < GRID_SIZE; col++) {
      let empty = [];
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        const idx = row * GRID_SIZE + col;
        if (newGrid[idx] === null) {
          empty.push(idx);
        } else if (empty.length) {
          const swapWith = empty.shift();
          newGrid[swapWith] = newGrid[idx];
          newGrid[idx] = null;
          empty.push(idx);
        }
      }
    }
    return newGrid.map((item) => (item === null ? randomItem() : item));
  };

  return (
    <div className="eco-crush-container">
      <h2 className="title">🌿 Eco Crush</h2>
      <div className="stats">
        <p>Score: {score}</p>
        <p>Moves Left: {moves}</p>
      </div>

      {message && <div className="popup">{message}</div>}

      <div className="grid">
        {grid.map((item, index) => (
          <motion.div
            key={index}
            className={`tile ${selected === index ? "selected" : ""}`}
            onClick={() => handleClick(index)}
            whileTap={{ scale: 0.9 }}
          >
            {item}
          </motion.div>
        ))}
      </div>

      {moves <= 0 && (
        <div className="game-over">
          <h3>Game Over 🌎</h3>
          <p>Your final eco score: {score}</p>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default EcoCrush;
