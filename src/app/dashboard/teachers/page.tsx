"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Teacher } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState({
    staffId: "",
    name: "",
    email: "",
    department: "",
    maxHoursPerDay: 6,
    maxHoursPerWeek: 30,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const data = await api.teachers.getAll();
      setTeachers(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load teachers");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.teachers.create(form);
      setForm({
        staffId: "",
        name: "",
        email: "",
        department: "",
        maxHoursPerDay: 6,
        maxHoursPerWeek: 30,
      });
      loadTeachers();
      alert("Teacher created successfully");
    } catch (error: any) {
      alert(error.message || "Failed to create teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    try {
      await api.teachers.delete(id);
      loadTeachers();
    } catch (error: any) {
      alert(error.message || "Failed to delete teacher");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Teachers Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Add Teacher</h2>
        
        <div>
          <Label>Staff ID (e.g., EMP-1023)</Label>
          <Input
            required
            value={form.staffId}
            onChange={(e) => setForm({ ...form, staffId: e.target.value })}
          />
        </div>

        <div>
          <Label>Name</Label>
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Dr. Sharma"
          />
        </div>

        <div>
          <Label>Email (Optional)</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="sharma@college.edu"
          />
        </div>

        <div>
          <Label>Department (Optional)</Label>
          <Input
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="Computer Science"
          />
        </div>

        <div>
          <Label>Max Hours Per Day</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={form.maxHoursPerDay}
            onChange={(e) => setForm({ ...form, maxHoursPerDay: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <Label>Max Hours Per Week</Label>
          <Input
            type="number"
            min="1"
            max="40"
            value={form.maxHoursPerWeek}
            onChange={(e) => setForm({ ...form, maxHoursPerWeek: parseInt(e.target.value) })}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Add Teacher"}
        </Button>
      </form>

      {/* Table */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">All Teachers</h2>
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 border">Staff ID</th>
              <th className="text-left p-3 border">Name</th>
              <th className="text-left p-3 border">Email</th>
              <th className="text-left p-3 border">Department</th>
              <th className="text-left p-3 border">Max Hrs/Day</th>
              <th className="text-left p-3 border">Max Hrs/Week</th>
              <th className="text-left p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t._id}>
                <td className="p-3 border">{t.staffId}</td>
                <td className="p-3 border">{t.name}</td>
                <td className="p-3 border">{t.email || "-"}</td>
                <td className="p-3 border">{t.department || "-"}</td>
                <td className="p-3 border">{t.maxHoursPerDay || 6}</td>
                <td className="p-3 border">{t.maxHoursPerWeek || 30}</td>
                <td className="p-3 border">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(t._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}