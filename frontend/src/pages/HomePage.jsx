import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { motion } from "framer-motion";
import { FaLeaf, FaTrophy, FaUsers } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/HomePage.css";

const HomePage = () => {
  const { theme } = useContext(ThemeContext);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/leaderboard");
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => b.points - a.points);
          setLeaderboard(sorted);
        }
      } catch (error) {
        console.error("❌ Failed to fetch leaderboard:", error);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className={`homepage text-${theme === "dark" ? "light" : "dark"}`}>
      {/* HERO */}
      <motion.section
        className={`hero ${theme === "dark" ? "hero-dark" : "hero-light"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="display-3 fw-bold text-center"
        >
          <span>PLAY, LEARN.</span>
          <span className={`mt-2 ${theme === "dark" ? "go-green-dark" : "go-green-light"}`}>
            GO GREEN.
          </span>
        </motion.h1>

        <div className="mt-4 d-flex justify-content-center">
          <a
            href="/login"
            className={`btn btn-lg btn-${theme === "dark" ? "success" : "primary"} px-4`}
          >
            Start Your Journey
          </a>
        </div>
      </motion.section>

      {/* FEATURES */}
      <section className="features container py-5 text-center" data-aos="fade-up">
        <h2 className="fw-bold mb-4">Why Join EcoQuest?</h2>
        <div className="row">
          {[
            { icon: <FaLeaf />, title: "Track Eco Actions", text: "Log your eco-friendly tasks and watch your green points grow!" },
            { icon: <FaUsers />, title: "Compete with Friends", text: "Join leaderboards and see who contributes most to our planet!" },
            { icon: <FaTrophy />, title: "Unlock Badges", text: "Complete challenges and earn unique green badges!" },
          ].map((item, i) => (
            <div key={i} className="col-md-4 mb-4">
              <div
                className={`card feature-card p-4 border-0 shadow ${theme === "dark" ? "bg-dark text-light" : "bg-light text-dark"}`}
              >
                <div className={`fs-1 mb-3 ${theme === "dark" ? "text-success" : "text-primary"}`}>
                  {item.icon}
                </div>
                <h5>{item.title}</h5>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LEADERBOARD */}
      <section className={`leaderboard-preview py-5 ${theme === "dark" ? "bg-success bg-opacity-10" : "bg-light"}`} data-aos="fade-up">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Top Green Heroes 🌍</h2>
          <div className="table-responsive">
            <table className={`table table-${theme === "dark" ? "dark" : "light"} table-striped table-hover rounded-3`}>
              <thead>
                <tr><th>#</th><th>Name</th><th>Points</th></tr>
              </thead>
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((user, index) => (
                    <tr key={user._id || index}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.points}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="text-muted">Loading leaderboard...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-4 text-center ${theme === "dark" ? "bg-dark text-muted" : "bg-light text-secondary"}`}>
        <div>© 2025 EcoQuest | Built with 💚 by Neural Networks</div>
      </footer>
    </div>
  );
};

export default HomePage;
