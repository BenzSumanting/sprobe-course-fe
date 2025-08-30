"use client";
import { useState } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";

export default function AddCourse({ onCourseAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cookies = parseCookies();
      const token = cookies.auth_token;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("credits", credits);

      const res = await axios.post(
        "http://127.0.0.1:8000/api/course",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Course added:", res.data);

      if (onCourseAdded) onCourseAdded(res.data);

      // Reset form
      setTitle("");
      setDescription("");
      setCredits("");

      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Error adding course:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Failed to add course. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add Course</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Credits</label>
          <input
            type="number"
            className="form-control"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Add Course"}
        </button>
      </form>
    </div>
  );
}
