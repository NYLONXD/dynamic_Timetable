"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
}

export default function TeacherTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const fetchTeachers = async () => {
    const { data, error } = await supabase.from("teachers").select("*");
    if (error) console.error(error);
    else setTeachers(data || []);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Teachers</h2>
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Email</th>
            <th className="text-left p-3">Department</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{t.name}</td>
              <td className="p-3">{t.email}</td>
              <td className="p-3">{t.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button onClick={fetchTeachers} className="mt-4">
        Refresh
      </Button>
    </div>
  );
}
