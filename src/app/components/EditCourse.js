"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";

export default function EditCourse({ courseId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("");
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [editId, setEditId] = useState(null);

  // assignment form states
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");

  const router = useRouter();

  // Fetch course + assignments
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const cookies = parseCookies();
        const token = cookies.auth_token;

        const res = await axios.get(
          `http://127.0.0.1:8000/api/course/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const course = res.data.data;
        setTitle(course.title);
        setDescription(course.description);
        setCredits(course.credits);
        setAssignments(course.assignments || []);
      } catch (err) {
        console.error("❌ Error fetching course:", err.response?.data || err);
        setError("Failed to fetch course details.");
      }
    };

    fetchCourse();
  }, [courseId]);

  // Update course
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cookies = parseCookies();
      const token = cookies.auth_token;

      const payload = { title, description, credits };

      await axios.put(`http://127.0.0.1:8000/api/course/${courseId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Error updating course:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update course.");
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const cookies = parseCookies();
      const token = cookies.auth_token;

      await axios.delete(`http://127.0.0.1:8000/api/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Error deleting course:", err.response?.data || err.message);
      setError("Failed to delete course.");
    }
  };

  // Open modal in "Add" mode
  const openAddModal = () => {
    setModalMode("add");
    setEditId(null);
    setAssignmentTitle("");
    setAssignmentDescription("");
    setAssignmentDueDate("");
    setShowModal(true);
  };

  // Open modal in "Edit" mode
  const openEditModal = (assignment) => {
    setModalMode("edit");
    setEditId(assignment.id);
    setAssignmentTitle(assignment.title);
    setAssignmentDescription(assignment.description);
    setAssignmentDueDate(assignment.due_date);
    setShowModal(true);
  };

  // Add or Update Assignment
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const cookies = parseCookies();
      const token = cookies.auth_token;

      const payload = {
        course_id: courseId,
        title: assignmentTitle,
        description: assignmentDescription,
        due_date: assignmentDueDate,
      };

      if (modalMode === "add") {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/assignment",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAssignments([...assignments, res.data.data]);
      } else {
        const res = await axios.put(
          `http://127.0.0.1:8000/api/assignment/${editId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAssignments(assignments.map((a) => (a.id === editId ? res.data.data : a)));
      }

      setAssignmentTitle("");
      setAssignmentDescription("");
      setAssignmentDueDate("");
      setEditId(null);
      setShowModal(false);
    } catch (err) {
      console.error("❌ Error saving assignment:", err.response?.data || err.message);
      setError("Failed to save assignment.");
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (id) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const cookies = parseCookies();
      const token = cookies.auth_token;

      await axios.delete(`http://127.0.0.1:8000/api/assignment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssignments(assignments.filter((a) => a.id !== id));
    } catch (err) {
      console.error("❌ Error deleting assignment:", err.response?.data || err.message);
      setError("Failed to delete assignment.");
    }
  };

  return (
    <div className="container mt-4">
      {/* ===== Page Header ===== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">📘 Edit Course</h2>
        <div className="btn-group">
          <button type="submit" form="courseForm" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "💾 Update"}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDeleteCourse}>
            🗑 Delete
          </button>
          <button type="button" className="btn btn-success" onClick={openAddModal}>
            ➕ Add Assignment
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => router.push("/dashboard")}>
            ✖ Close
          </button>
        </div>
      </div>

      {error && <p className="text-danger">{error}</p>}

      <div className="row">
        {/* ===== Course Details Form ===== */}
        <div className="col-md-6 mb-4">
          <form id="courseForm" onSubmit={handleCourseSubmit} className="card shadow-sm p-4">
            <h5 className="mb-3">Course Details</h5>

            <div className="mb-3">
              <label className="form-label fw-bold">Title</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Credits</label>
              <input
                type="number"
                className="form-control"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                required
              />
            </div>
          </form>
        </div>

        {/* ===== Assignment List ===== */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-4">
            <h5 className="mb-3">Assignments</h5>

            <ul className="list-group">
              {assignments.map((a) => (
                <li key={a.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{a.title}</strong> <br />
                    <small className="text-muted">{a.description}</small> <br />
                    <span className="badge bg-light text-dark me-2">📅 Created: {a.created_at}</span>
                    <span className="badge bg-warning text-dark">⏰ Due: {a.due_date}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-warning" onClick={() => openEditModal(a)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAssignment(a.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
              {assignments.length === 0 && (
                <li className="list-group-item text-muted">No assignments yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ===== Modal (Add / Edit Assignment) ===== */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleAssignmentSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalMode === "add" ? "➕ Add Assignment" : "✏️ Edit Assignment"}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={assignmentTitle}
                      onChange={(e) => setAssignmentTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={assignmentDescription}
                      onChange={(e) => setAssignmentDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={assignmentDueDate}
                      onChange={(e) => setAssignmentDueDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    ✖ Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modalMode === "add" ? "💾 Save" : "🔄 Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
