"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
  useEffect(() => {
    // Load Bootstrap JS bundle (with Popper)
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <div className="container mt-4">
      <div>{children}</div>
    </div>
  );
}
