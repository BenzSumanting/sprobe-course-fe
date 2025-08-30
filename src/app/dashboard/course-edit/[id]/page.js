"use client";
import React, { use } from "react";
import EditCourse from "../../../components/EditCourse";

export default function StudentEditPage({ params }) {
  const { id } = use(params);

  return <EditCourse courseId={id} />;
}
    