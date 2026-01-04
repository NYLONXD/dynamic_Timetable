"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "theory" as "theory" | "lab" | "seminar" | "tutorial",
    defaultCredits: 3,
    requiresConsecutive: false,
    defaultSessionLength: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await api.subjects.getAll();
      setSubjects(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load subjects");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.subjects.create(form);
      setForm({
        code: "",
        name: "",
        category: "theory",
        defaultCredits: 3,
        requiresConsecutive: false,
        defaultSessionLength: 1,
      });
      loadSubjects();
      alert("Subject created successfully");
    } catch (error: any) {
      alert(error.message || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject?")) return;
    try {
      await api.subjects.delete(id);
      loadSubjects();
    } catch (error: any) {
      alert(error.message || "Failed to delete subject");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Subjects Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Add Subject</h2>
        
        <div>
          <Label>Code (e.g., CS301)</Label>
          <Input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </div>

        <div>
          <Label>Name</Label>
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Data Structures"
          />
        </div>

        <div>
          <Label>Category</Label>
          <select
            className="w-full h-9 rounded-md border px-3"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as any })}
          >
            <option value="theory">Theory</option>
            <option value="lab">Lab</option>
            <option value="seminar">Seminar</option>
            <option value="tutorial">Tutorial</option>
          </select>
        </div>

        <div>
          <Label>Default Credits (per week)</Label>
          <Input
            type="number"
            min="1"
            value={form.defaultCredits}
            onChange={(e) => setForm({ ...form, defaultCredits: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <Label>Session Length (periods)</Label>
          <Input
            type="number"
            min="1"
            max="4"
            value={form.defaultSessionLength}
            onChange={(e) => setForm({ ...form, defaultSessionLength: parseInt(e.target.value) })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.requiresConsecutive}
            onChange={(e) => setForm({ ...form, requiresConsecutive: e.target.checked })}
          />
          <Label>Requires Consecutive Periods (for labs)</Label>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Add Subject"}
        </Button>
      </form>

      {/* Table */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">All Subjects</h2>
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 border">Code</th>
              <th className="text-left p-3 border">Name</th>
              <th className="text-left p-3 border">Category</th>
              <th className="text-left p-3 border">Credits</th>
              <th className="text-left p-3 border">Session Length</th>
              <th className="text-left p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s._id}>
                <td className="p-3 border">{s.code}</td>
                <td className="p-3 border">{s.name}</td>
                <td className="p-3 border">{s.category}</td>
                <td className="p-3 border">{s.defaultCredits || "-"}</td>
                <td className="p-3 border">{s.defaultSessionLength || 1}</td>
                <td className="p-3 border">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(s._id)}
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