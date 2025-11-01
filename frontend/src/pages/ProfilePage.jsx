

/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { FaSignOutAlt } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react"; // ✅ import QR code generator

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [selectedDate, setSelectedDate] = useState(null);
  const [activitiesForDate, setActivitiesForDate] = useState([]);
  const [todaySummary, setTodaySummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const summaryRef = useRef();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser) navigate("/login");
    else setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  if (!user) return null;

  const activityDates = user.calendar?.map((entry) => new Date(entry.date)) || [];

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const isActive = activityDates.some(
        (d) =>
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
      );
      return isActive ? "activity-date" : null;
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const activities =
      user.calendar?.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getDate() === date.getDate() &&
          entryDate.getMonth() === date.getMonth() &&
          entryDate.getFullYear() === date.getFullYear()
        );
      }) || [];
    setActivitiesForDate(activities);
  };

  const handleSummarizeToday = async () => {
    if (!user.calendar || user.calendar.length === 0) {
      setTodaySummary("No activities today to summarize.");
      return;
    }

    const today = new Date();
    const todaysActivities = user.calendar.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getDate() === today.getDate() &&
        entryDate.getMonth() === today.getMonth() &&
        entryDate.getFullYear() === today.getFullYear()
      );
    });

    if (todaysActivities.length === 0) {
      setTodaySummary("No activities today to summarize.");
      return;
    }

    setLoadingSummary(true);
    try {
      const res = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activities: todaysActivities, name: user.name }),
      });
      const data = await res.json();
      setTodaySummary(data.summary || "Failed to generate summary.");
    } catch (err) {
      console.error(err);
      setTodaySummary("Error summarizing today's activities.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleDownloadInstagram = async () => {
    if (!summaryRef.current) return;
    try {
      const canvas = await html2canvas(summaryRef.current, { scale: 2 });
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `eco_summary_${new Date().toISOString()}.png`;
      link.click();
    } catch (err) {
      console.error("Error exporting image:", err);
    }
  };

  const handleCopyLinkedIn = () => {
    if (!todaySummary) return;
    navigator.clipboard.writeText(todaySummary);
    alert("Summary copied! Paste it in LinkedIn post.");
  };

  return (
    <div
      className={`profile-page py-5 ${theme === "dark" ? "bg-dark text-light" : "bg-light text-dark"}`}
      style={{
        minHeight: "100vh",
        backgroundImage:
          "url('https://i.pinimg.com/originals/2c/2f/9e/2c2f9e97b6d42fdb8ac2446e0818f969.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container text-center">
        <h1 className="mb-3">Welcome, {user.name}!</h1>
        <p className="text-muted mb-4">{user.email}</p>

        {/* Points */}
        <div
          className={`points-card mx-auto mb-5 p-4 rounded shadow ${
            theme === "dark" ? "bg-secondary text-light" : "bg-white text-dark"
          }`}
          style={{ maxWidth: "400px" }}
        >
          <h3>Total Points</h3>
          <h1 className="display-4 fw-bold text-success">{user.points || 0}</h1>
        </div>

        {/* Calendar */}
        <div className="calendar-section mb-5">
          <h4>Your Activity Calendar</h4>
          <div className="d-flex justify-content-center mt-3">
            <Calendar
              onClickDay={handleDateClick}
              value={selectedDate || new Date()}
              tileClassName={tileClassName}
              className={`rounded shadow-lg p-3 ${
                theme === "dark" ? "bg-secondary text-light" : "bg-white text-dark"
              }`}
            />
          </div>
        </div>

        {/* Summarize */}
        <div className="my-4">
          <button
            className="btn btn-warning px-4"
            onClick={handleSummarizeToday}
            disabled={loadingSummary}
          >
            {loadingSummary ? "Summarizing..." : "Summarize Today's Actions"}
          </button>

          {todaySummary && (
            <>
              <div
                ref={summaryRef}
                className={`mt-3 p-3 rounded shadow ${
                  theme === "dark" ? "bg-dark text-light" : "bg-light text-dark"
                }`}
                style={{ maxWidth: "600px", margin: "0 auto" }}
              >
                {todaySummary}
              </div>

              <div className="mt-3 d-flex justify-content-center gap-3">
                <button className="btn btn-success" onClick={handleDownloadInstagram}>
                  Download for Instagram
                </button>
                <button className="btn btn-primary" onClick={handleCopyLinkedIn}>
                  Copy for LinkedIn
                </button>
              </div>

              {/* ✅ QR Code for Summary */}
              <div className="text-center mt-5 mb-4">
                <h4 className="fw-bold">Today's Activity Summary QR</h4>
                <p className="text-muted">
                  Scan this QR to view your daily eco-summary
                </p>
                <QRCodeCanvas
                  value={todaySummary || "No summary available."}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                  className="shadow rounded"
                />
              </div>
            </>
          )}
        </div>

        {/* Logout */}
        <button className="btn btn-outline-danger mt-5 px-4" onClick={handleLogout}>
          <FaSignOutAlt className="me-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

