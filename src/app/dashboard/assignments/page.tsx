"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Assignment, Section, Subject, Teacher } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState({
    sectionId: "",
    subjectId: "",
    teacherId: "",
    sessions: {
      perWeek: 3,
      length: 1,
    },
    constraint: "hard" as "hard" | "soft",
    priority: 5,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsData, sectionsData, subjectsData, teachersData] = await Promise.all([
        api.assignments.getAll(),
        api.sections.getAll(),
        api.subjects.getAll(),
        api.teachers.getAll(),
      ]);
      setAssignments(assignmentsData);
      setSections(sectionsData);
      setSubjects(subjectsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error(error);
      alert("Failed to load data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.assignments.create(form);
      setForm({
        sectionId: "",
        subjectId: "",
        teacherId: "",
        sessions: { perWeek: 3, length: 1 },
        constraint: "hard",
        priority: 5,
      });
      loadData();
      alert("Assignment created successfully");
    } catch (error: any) {
      alert(error.message || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      await api.assignments.delete(id);
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to delete assignment");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Assignments Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Create Assignment</h2>
        
        <div>
          <Label>Section</Label>
          <select
            required
            className="w-full h-9 rounded-md border px-3"
            value={form.sectionId}
            onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
          >
            <option value="">Select Section</option>
            {sections.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} - {s.name || s.branch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Subject</Label>
          <select
            required
            className="w-full h-9 rounded-md border px-3"
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Teacher</Label>
          <select
            required
            className="w-full h-9 rounded-md border px-3"
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.staffId} - {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Classes Per Week</Label>
          <Input
            required
            type="number"
            min="1"
            max="10"
            value={form.sessions.perWeek}
            onChange={(e) =>
              setForm({
                ...form,
                sessions: { ...form.sessions, perWeek: parseInt(e.target.value) },
              })
            }
          />
        </div>

        <div>
          <Label>Session Length (consecutive periods)</Label>
          <Input
            required
            type="number"
            min="1"
            max="4"
            value={form.sessions.length}
            onChange={(e) =>
              setForm({
                ...form,
                sessions: { ...form.sessions, length: parseInt(e.target.value) },
              })
            }
          />
        </div>

        <div>
          <Label>Constraint</Label>
          <select
            className="w-full h-9 rounded-md border px-3"
            value={form.constraint}
            onChange={(e) => setForm({ ...form, constraint: e.target.value as any })}
          >
            <option value="hard">Hard (Must Satisfy)</option>
            <option value="soft">Soft (Try to Satisfy)</option>
          </select>
        </div>

        <div>
          <Label>Priority (1=Low, 10=High)</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Assignment"}
        </Button>
      </form>

      {/* Table */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">All Assignments</h2>
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 border">Section</th>
              <th className="text-left p-3 border">Subject</th>
              <th className="text-left p-3 border">Teacher</th>
              <th className="text-left p-3 border">Classes/Week</th>
              <th className="text-left p-3 border">Length</th>
              <th className="text-left p-3 border">Constraint</th>
              <th className="text-left p-3 border">Priority</th>
              <th className="text-left p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a._id}>
                <td className="p-3 border">
                  {typeof a.sectionId === "object" ? a.sectionId.code : a.sectionId}
                </td>
                <td className="p-3 border">
                  {typeof a.subjectId === "object" ? a.subjectId.name : a.subjectId}
                </td>
                <td className="p-3 border">
                  {typeof a.teacherId === "object" ? a.teacherId.name : a.teacherId}
                </td>
                <td className="p-3 border">{a.sessions.perWeek}</td>
                <td className="p-3 border">{a.sessions.length}</td>
                <td className="p-3 border">{a.constraint}</td>
                <td className="p-3 border">{a.priority || 5}</td>
                <td className="p-3 border">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(a._id)}
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