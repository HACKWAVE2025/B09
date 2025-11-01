import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Leaderboard from "./pages/Leaderboard";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import DailyQuest from "./pages/DailyQuest";
import EcoCrush from "./pages/EcoCrush"; // 🌿 IMPORT THE GAME PAGE
import EcoChatbot from "./components/EchoChatBot"; // 🌿 IMPORT THE CHATBOT COMPONENT
const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>

          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/activity" element={<ActivitiesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/dailyquest" element={<DailyQuest />} />
          <Route path="/ecocrush" element={<EcoCrush />} /> {/* 🌿 ADD THE ROUTE */}
        </Routes>
        <EcoChatbot />
      </Layout>
    </Router>
  );
};

export default App;
