"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Section } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    semester: 1,
    branch: "",
    strength: 60,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const data = await api.sections.getAll();
      setSections(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load sections");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.sections.create(form);
      setForm({ code: "", name: "", semester: 1, branch: "", strength: 60 });
      loadSections();
      alert("Section created successfully");
    } catch (error: any) {
      alert(error.message || "Failed to create section");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    try {
      await api.sections.delete(id);
      loadSections();
    } catch (error: any) {
      alert(error.message || "Failed to delete section");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sections Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Add Section</h2>
        
        <div>
          <Label>Code (e.g., CSE-A)</Label>
          <Input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </div>

        <div>
          <Label>Name (Optional)</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Computer Science A"
          />
        </div>

        <div>
          <Label>Semester</Label>
          <Input
            required
            type="number"
            min="1"
            max="12"
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <Label>Branch</Label>
          <Input
            required
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
            placeholder="Computer Science"
          />
        </div>

        <div>
          <Label>Strength (Students)</Label>
          <Input
            type="number"
            min="1"
            value={form.strength}
            onChange={(e) => setForm({ ...form, strength: parseInt(e.target.value) })}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Add Section"}
        </Button>
      </form>

      {/* Table */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">All Sections</h2>
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 border">Code</th>
              <th className="text-left p-3 border">Name</th>
              <th className="text-left p-3 border">Semester</th>
              <th className="text-left p-3 border">Branch</th>
              <th className="text-left p-3 border">Strength</th>
              <th className="text-left p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => (
              <tr key={s._id}>
                <td className="p-3 border">{s.code}</td>
                <td className="p-3 border">{s.name || "-"}</td>
                <td className="p-3 border">{s.semester}</td>
                <td className="p-3 border">{s.branch}</td>
                <td className="p-3 border">{s.strength || "-"}</td>
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