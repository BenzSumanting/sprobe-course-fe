"use client";
import React, { use } from "react";
import StudentEdit from "../../../components/EditStudent";

export default function StudentEditPage({ params }) {
  const { id } = use(params);

  return <StudentEdit studentId={id} />;
}
    