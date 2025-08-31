"use client";
import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/navigation";

export default function AddStudent({
  onStudentAdded,
  onClose,
  alreadyAddedCourses = [],
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api().get("/course");
        const filtered = res.data.data.filter(
          (course) => !alreadyAddedCourses.includes(course.id)
        );
        setCourses(filtered);
      } catch (err) {
        console.error("Error fetching courses:", err.response?.data || err);
      }
    };

    fetchCourses();
  }, [alreadyAddedCourses]);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("age", age);

      selectedCourses.forEach((courseId) =>
        formData.append("courses[]", String(courseId))
      );

      if (image) formData.append("image", image);

      const res = await api().post("/student", formData);

      if (onStudentAdded) onStudentAdded(res.data);

      setName("");
      setEmail("");
      setAge("");
      setSelectedCourses([]);
      setImage(null);

      if (onClose) onClose();
      else router.push("/dashboard");
    } catch (err) {
      console.error(
        "Error adding student:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to add student.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
    else router.push("/dashboard");
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Add Student</h5>
        </div>
        <div className="card-body">
          {error && <p className="text-danger">{error}</p>}
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Age</label>
              <input
                type="number"
                className="form-control"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Profile Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                disabled={loading}
              />
              {image && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    width={100}
                    className="rounded"
                  />
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Courses</label>
              <div
                className="border p-2 rounded"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <div key={course.id} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`course-${course.id}`}
                        checked={selectedCourses.includes(course.id)}
                        disabled={loading}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCourses([...selectedCourses, course.id]);
                          } else {
                            setSelectedCourses(
                              selectedCourses.filter((id) => id !== course.id)
                            );
                          }
                        }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`course-${course.id}`}
                      >
                        {course.title}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No available courses</p>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                ✖ Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "⏳ Saving..." : "💾 Add Student"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
