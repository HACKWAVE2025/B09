import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaCheck, FaLeaf, FaMapMarkerAlt } from "react-icons/fa";
import tasks from "./tasks";
import "../styles/EcoTaskPage.css";

const IMAGGA_API_KEY = "acc_cf8bf8db4c1dddb";
const IMAGGA_API_SECRET = "227c5794c787cde07c04d26194b67c85";

export default function EcoTaskPage({ day, onBack, onCompleteTask }) {
  // 🌿 User and completion state
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [completed, setCompleted] = useState(() =>
    user ? day <= user.highestCompletedLevel : false
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  const todayTask = tasks[day - 1]?.[0] || "No task assigned for this day";

  // ✅ Get user geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude.toFixed(5),
            longitude: position.coords.longitude.toFixed(5),
          });
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // ✅ Handle file upload and preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewURL(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewURL(null);
    }
  };

  // ✅ Verify image using Imagga (like ActivitiesPage)
  const checkTaskImage = async (file, task) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("https://api.imagga.com/v2/tags", {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${IMAGGA_API_KEY}:${IMAGGA_API_SECRET}`),
        },
        body: formData,
      });

      const data = await response.json();
      if (data.result && data.result.tags) {
        const tags = data.result.tags.map((t) => t.tag.en.toLowerCase());
        const keywords = task.toLowerCase().split(" ");
        return keywords.some((kw) =>
          tags.some((tag) => tag.includes(kw) || kw.includes(tag))
        );
      }
    } catch (err) {
      console.error("Error checking image:", err);
    }

    return false;
  };

  // ✅ Handle complete task with image verification + backend update
  const handleComplete = async (e) => {
    e.preventDefault();
    if (completed || loading || !user) return;
    if (!file) return setMessage("Please upload an image of your task!");

    setLoading(true);
    setMessage("");

    // 🔍 Verify the image
    const isValid = await checkTaskImage(file, todayTask);
    if (!isValid) {
      setMessage("❌ The uploaded image doesn’t match today’s eco-task!");
      setLoading(false);
      return;
    }

    try {
      // 🧾 Backend call to update progress
      const res = await fetch("https://b09-backend.onrender.com/api/users/complete-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          levelCompleted: day,
          pointsToAdd: 10,
        }),
      });

      if (!res.ok) throw new Error("Failed to update level in database");

      const { user: updatedUser } = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setCompleted(true);
      window.dispatchEvent(new Event("storage"));

      setMessage("✅ Task verified and marked as completed!");
      onCompleteTask(todayTask);
    } catch (err) {
      console.error("Error completing level:", err);
      setMessage("❌ Failed to save progress. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eco-task-container">
      <button className="eco-task-header" onClick={onBack}>
        <FaArrowLeft /> Back
      </button>

      <h2>🌍 Day {day} Challenge</h2>
      <p className="task-desc">{todayTask}</p>

      <form onSubmit={handleComplete}>
        {/* 📸 Image Upload */}
        <div className="mb-3">
          <label className="form-label">Upload Image for Today’s Task</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>

        {/* 🖼 Preview + Location */}
        {previewURL && (
          <div className="mt-3">
            <img
              src={previewURL}
              alt="Preview"
              style={{
                maxWidth: "100%",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            />
            {location.latitude && (
              <p className="text-muted small">
                <FaMapMarkerAlt className="me-2 text-danger" />
                Lat: {location.latitude}, Lon: {location.longitude}
              </p>
            )}
          </div>
        )}

        {message && <div className="alert alert-info mt-3">{message}</div>}

        <button
          type="submit"
          className="eco-btn mt-3"
          disabled={completed || loading}
        >
          {completed ? (
            <>
              <FaCheck className="inline mr-2" /> Completed
            </>
          ) : loading ? (
            "Verifying..."
          ) : (
            "Submit & Complete"
          )}
        </button>
      </form>
    </div>
  );
}
