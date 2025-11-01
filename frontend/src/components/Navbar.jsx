// src/components/Navbar.jsx
import React, { useContext, useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, []);

  return (
    <nav
      className={`navbar navbar-expand-lg py-3 ${theme === "dark" ? "navbar-dark" : "navbar-light"} bg-transparent`}
    >
      <div className="container-fluid">
        <a
          className={`navbar-brand fw-bold fs-3 ${theme === "dark" ? "text-success" : "text-primary"}`}
          href="/"
        >
          🌱 EcoQuest
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav gap-3 align-items-center">
            <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
            <li className="nav-item"><a className="nav-link" href="/activity">Activity</a></li>
            <li className="nav-item"><a className="nav-link" href="/leaderboard">Leaderboard</a></li>
            <li className="nav-item"><a className="nav-link" href="/dailyquest">Daily-Quest</a></li>

            <li className="nav-item">
              {user ? (
                <a href="/profile" className={`btn btn-${theme === "dark" ? "success" : "primary"} px-3 fw-semibold`}>
                  {user.name}
                </a>
              ) : (
                <a href="/login" className={`btn btn-${theme === "dark" ? "success" : "primary"} px-3 fw-semibold`}>
                  Join Now
                </a>
              )}
            </li>

            <li className="nav-item ms-3">
              <button
                className="btn btn-outline-secondary rounded-circle p-2"
                onClick={toggleTheme}
              >
                {theme === "dark" ? <FaSun className="text-warning" /> : <FaMoon className="text-dark" />}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
