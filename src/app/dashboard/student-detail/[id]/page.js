"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { parseCookies } from "nookies";

export default function StudentForm({ student = null }) {
  const [name, setName] = useState(student?.name || "");
  const [email, setEmail] = useState(student?.email || "");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const cookies = parseCookies();
  const token = cookies.auth_token;

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/course", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        courses: selectedCourses, // array of course IDs
      };

      if (student) {
        // Update existing student
        await axios.put(
          `http://127.0.0.1:8000/api/student/${student.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new student
        await axios.post("http://127.0.0.1:8000/api/student", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      alert("Student saved successfully!");
    } catch (err) {
      console.error("Error saving student:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-4">
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
        <label className="form-label">Courses</label>
        <select
          multiple
          className="form-select"
          value={selectedCourses}
          onChange={(e) =>
            setSelectedCourses(
              Array.from(e.target.selectedOptions, (option) => parseInt(option.value))
            )
          }
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Saving..." : "Save Student"}
      </button>
    </form>
  );
}
