"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";

export default function AddStudent({
  onStudentAdded,
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

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const cookies = parseCookies();
        const token = cookies.auth_token;

        const res = await axios.get("http://127.0.0.1:8000/api/course", {
          headers: { Authorization: `Bearer ${token}` },
        });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cookies = parseCookies();
      const token = cookies.auth_token;

      // Prepare FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("age", age);

      // Append courses properly as multiple entries
      selectedCourses.forEach((courseId) =>
        formData.append("courses[]", String(courseId))
      );

      if (image) {
        formData.append("image", image);
      }

      // Debug: log what’s being sent
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await axios.post(
        "http://127.0.0.1:8000/api/student",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // ❌ don’t set Content-Type manually, axios will handle it
          },
        }
      );

      console.log("✅ Student added:", res.data);

      if (onStudentAdded) onStudentAdded(res.data);

      // Reset form
      setName("");
      setEmail("");
      setAge("");
      setSelectedCourses([]);
      setImage(null);

      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Error adding student:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Failed to add student. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add Student</h2>
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
          />
        </div>

        {/* Profile Image */}
        <div className="mb-3">
          <label className="form-label">Profile Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
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

        {/* Courses Checkboxes */}
        <div className="mb-3">
          <label className="form-label">Courses</label>
          <div
            className="border p-2"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {courses.map((course) => (
              <div key={course.id} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`course-${course.id}`}
                  checked={selectedCourses.includes(course.id)}
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
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Add Student"}
        </button>
      </form>
    </div>
  );
}
