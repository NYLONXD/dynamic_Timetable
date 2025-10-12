"use client";
import TeacherForm from "@/components/Teachers/TeacherForms";
import TeacherTable from "@/components/Teachers/TeacherTable";

import { useState } from "react";

export default function TeachersPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="p-8 space-y-6">
      <TeacherForm onAdded={() => setRefreshKey((prev) => prev + 1)} />
      <TeacherTable key={refreshKey} />
    </div>
  );
}
