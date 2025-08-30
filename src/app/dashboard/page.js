"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Fetch data when tab changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cookies = parseCookies();
        const token = cookies.auth_token;

        if (activeTab === "students") {
          const res = await axios.get("http://127.0.0.1:8000/api/student", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStudents(res.data.data);
        } else if (activeTab === "courses") {
          const res = await axios.get("http://127.0.0.1:8000/api/course", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCourses(res.data.data);
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleView = (item, type) => {
    if (type === "student") {
      router.push(`dashboard/student-edit/${item.id}`);
    } else if (type === "course") {
      router.push(`dashboard/course-edit/${item.id}`);
    }
  };

  const handleAdd = (type) => {
    if (type === "student") {
      router.push("dashboard/student-add");
    } else if (type === "course") {
      router.push("dashboard/course-add");
    }
  };

  return (
    <div className="container mt-4">
      {/* Nav Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            Students
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            Courses
          </button>
        </li>
      </ul>

      {/* Content */}
      <div>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : activeTab === "students" ? (
          <div className="card shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">📘 Students</h4>
              <button
                className="btn btn-success px-4"
                onClick={() => handleAdd("student")}
              >
                ➕ Add Student
              </button>
            </div>

            {students.length > 0 ? (
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th style={{ width: "120px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary w-100"
                          onClick={() => handleView(student, "student")}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted">No students found.</p>
            )}
          </div>
        ) : (
          <div className="card shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">📚 Courses</h4>
              <button
                className="btn btn-success px-4"
                onClick={() => handleAdd("course")}
              >
                ➕ Add Course
              </button>
            </div>

            {courses.length > 0 ? (
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Course</th>
                    <th>Description</th>
                    <th style={{ width: "120px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>{course.id}</td>
                      <td>{course.title}</td>
                      <td>{course.description}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary w-100"
                          onClick={() => handleView(course, "course")}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted">No courses available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
