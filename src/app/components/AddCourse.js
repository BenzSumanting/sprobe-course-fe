"use client";
import { useState } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";

export default function AddCourse({ onCourseAdded }) {
  const [form, setForm] = useState({ title: "", description: "", credits: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple validation
    if (form.title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (Number(form.credits) < 1) {
      setError("Credits must be at least 1.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const cookies = parseCookies();
      const token = cookies.auth_token;

      const res = await axios.post(
        "http://127.0.0.1:8000/api/course",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("✅ Course added successfully!");
      if (onCourseAdded) onCourseAdded(res.data.data);

      // Reset form
      setForm({ title: "", description: "", credits: "" });

      // Redirect after short delay
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      console.error("❌ Error adding course:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to add course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">➕ Add New Course</h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label fw-bold">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={form.title}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Description</label>
          <textarea
            name="description"
            className="form-control"
            rows="3"
            value={form.description}
            onChange={handleChange}
            disabled={loading}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Credits</label>
          <input
            type="number"
            name="credits"
            className="form-control"
            min="1"
            value={form.credits}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => router.push("/dashboard")}
            disabled={loading}
          >
            ✖ Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "⏳ Saving..." : "💾 Add Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
