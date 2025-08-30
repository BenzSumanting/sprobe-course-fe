"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";

export default function StudentEdit({ studentId }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  // Modal state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [submittedAt, setSubmittedAt] = useState("");
  const [grade, setGrade] = useState("");
  const [studentSubmissions, setStudentSubmissions] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cookies = parseCookies();
        const token = cookies.auth_token;

        // Fetch student data
        const studentRes = await axios.get(
          `http://127.0.0.1:8000/api/student/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const student = studentRes.data.data;

        setName(student.name);
        setEmail(student.email);
        setAge(student.age);
        setCurrentImage(student.image || null);
        setStudentSubmissions(student.submissions || []);
        setSelectedCourses(student.courses.map((c) => c.id));

        // Fetch all courses from system
        const coursesRes = await axios.get(`http://127.0.0.1:8000/api/course`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allCourses = coursesRes.data.data;

        // Merge assignments from student courses into all courses
        const mergedCourses = allCourses.map((course) => {
          const studentCourse = student.courses.find((c) => c.id === course.id);
          return {
            ...course,
            assignments: studentCourse?.assignments || [],
          };
        });

        setCourses(mergedCourses);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err);
        setError("Failed to fetch student or courses.");
      }
    };

    fetchData();
  }, [studentId]);

  const openAssignmentModal = async () => {
    setShowAssignmentModal(true);
    try {
      const cookies = parseCookies();
      const token = cookies.auth_token;

      const res = await axios.get(
        `http://127.0.0.1:8000/api/student/${studentId}/assignment`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAssignments(res.data.data);
    } catch (err) {
      console.error("Error fetching assignments:", err.response?.data || err);
      setError("Failed to fetch assignments.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cookies = parseCookies();
      const token = cookies.auth_token;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("age", age);
      selectedCourses.forEach((courseId) =>
        formData.append("courses[]", String(courseId))
      );
      if (image) formData.append("image", image);

      await axios.post(
        `http://127.0.0.1:8000/api/student/${studentId}?_method=PUT`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push("/dashboard");
    } catch (err) {
      console.error("Error updating student:", err.response?.data || err.message);
      setError("Failed to update student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🎓 Edit Student</h2>
        <div className="btn-group">
          <button
            type="submit"
            form="studentForm"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "💾 Update"}
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={openAssignmentModal}
          >
            📤 Submit Assignment
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => alert("Delete Assignment clicked!")}
          >
            🗑 Delete
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => router.push("/dashboard")}
          >
            ✖ Close
          </button>
        </div>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {/* Tabs */}
      <ul className="nav nav-pills mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Profile
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "grades" ? "active" : ""}`}
            onClick={() => setActiveTab("grades")}
          >
            📊 Grades
          </button>
        </li>
      </ul>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form
          id="studentForm"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="card shadow-sm p-4"
        >
          {/* Profile Image */}
          <div className="mb-4 text-center position-relative d-inline-block">
            <input
              type="file"
              id="profileImageInput"
              className="d-none"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
            <div
              style={{ cursor: "pointer", display: "inline-block" }}
              onClick={() =>
                document.getElementById("profileImageInput").click()
              }
              className="position-relative"
            >
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  width={150}
                  height={150}
                  className="rounded-circle shadow-sm border"
                />
              ) : currentImage ? (
                <img
                  src={currentImage}
                  alt="Current Profile"
                  width={150}
                  height={150}
                  className="rounded-circle shadow-sm border"
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-light rounded-circle shadow-sm"
                  style={{
                    width: "150px",
                    height: "150px",
                    border: "2px dashed #ccc",
                  }}
                >
                  <span className="text-muted">📷 Upload</span>
                </div>
              )}
            </div>
            <p className="text-muted mt-2">Click the image to change</p>
          </div>

          {/* Name, Email, Age */}
          <div className="mb-3">
            <label className="form-label fw-bold">Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Age</label>
            <input
              type="number"
              className="form-control"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>

          {/* Courses */}
          <div className="mb-3">
            <label className="form-label fw-bold">Courses</label>
            <div
              className="border rounded p-3 bg-light"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {courses.map((course) => (
                <div key={course.id} className="form-check mb-2">
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
                    className="form-check-label fw-normal"
                    htmlFor={`course-${course.id}`}
                  >
                    {course.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* Grades Tab */}
      {activeTab === "grades" && (
        <div className="card shadow-sm p-4">
          <h4 className="mb-3">📊 Grades</h4>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Course</th>
                <th>Assignment</th>
                <th>Grade</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {studentSubmissions.map((submission, index) => {
                const course = courses.find((c) =>
                  c.assignments.some((a) => a.id === submission.assignment_id)
                );
                const assignment = course?.assignments.find(
                  (a) => a.id === submission.assignment_id
                );

                return (
                  <tr key={index}>
                    <td>{course?.title ?? "-"}</td>
                    <td>{assignment?.title ?? "-"}</td>
                    <td>{submission.grade}</td>
                    <td>{submission.submitted_at}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showAssignmentModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Submit Assignment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAssignmentModal(false)}
                ></button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const cookies = parseCookies();
                    const token = cookies.auth_token;

                    await axios.post(
                      `http://127.0.0.1:8000/api/student/${studentId}/score`,
                      {
                        assignment_id: selectedAssignment,
                        submitted_at: submittedAt,
                        grade,
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    alert("Grade submitted successfully!");
                    setShowAssignmentModal(false);
                    setSelectedAssignment("");
                    setGrade("");
                    setSubmittedAt("");

                    const studentRes = await axios.get(
                      `http://127.0.0.1:8000/api/student/${studentId}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setStudentSubmissions(studentRes.data.data.submissions || []);
                  } catch (err) {
                    console.error(
                      "Error submitting grade:",
                      err.response?.data || err
                    );
                    setError("Failed to submit grade.");
                  }
                }}
              >
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Select Assignment</label>
                    <select
                      className="form-select"
                      value={selectedAssignment}
                      onChange={(e) => {
                        setSelectedAssignment(e.target.value);
                        const assignment = assignments.find(
                          (a) => a.id === e.target.value
                        );
                        setSubmittedAt(
                          assignment?.submitted_at
                            ? new Date(assignment.submitted_at)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        );
                      }}
                      required
                    >
                      <option value="">-- Choose assignment --</option>
                      {assignments.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title} ({a.course_title})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedAssignment && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Submitted At</label>
                      <input
                        type="date"
                        className="form-control"
                        value={submittedAt}
                        onChange={(e) => setSubmittedAt(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-bold">Grade</label>
                    <input
                      type="text"
                      className="form-control"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="Enter grade"
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAssignmentModal(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Grade
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
