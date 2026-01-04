"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Generation } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function TimetableListPage() {
  const router = useRouter();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    try {
      const data = await api.timetable.getAll();
      setGenerations(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load timetables");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this timetable?")) return;
    try {
      await api.timetable.delete(id);
      loadGenerations();
    } catch (error: any) {
      alert(error.message || "Failed to delete timetable");
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm("Activate this timetable? This will deactivate all others.")) return;
    try {
      await api.timetable.activate(id);
      loadGenerations();
      alert("Timetable activated successfully");
    } catch (error: any) {
      alert(error.message || "Failed to activate timetable");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Timetables</h1>
        <Button onClick={() => router.push("/dashboard/timetable/generate")}>
          Generate New Timetable
        </Button>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 border">Name</th>
              <th className="text-left p-3 border">Status</th>
              <th className="text-left p-3 border">Days</th>
              <th className="text-left p-3 border">Periods/Day</th>
              <th className="text-left p-3 border">Gen Time</th>
              <th className="text-left p-3 border">Created</th>
              <th className="text-left p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {generations.map((g) => (
              <tr key={g._id}>
                <td className="p-3 border">{g.name}</td>
                <td className="p-3 border">
                  <span className={`px-2 py-1 rounded text-xs ${
                    g.status === 'active' ? 'bg-green-500 text-white' :
                    g.status === 'draft' ? 'bg-yellow-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {g.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-3 border">{g.config.days.length}</td>
                <td className="p-3 border">{g.config.periodsPerDay}</td>
                <td className="p-3 border">{g.generationTime?.toFixed(2)}s</td>
                <td className="p-3 border">
                  {new Date(g.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 border">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/timetable/${g._id}`)}
                    >
                      View
                    </Button>
                    {g.status !== 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActivate(g._id)}
                      >
                        Activate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(g._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {generations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No timetables generated yet. Click "Generate New Timetable" to get started.
          </div>
        )}
      </div>
    </div>
  );
}