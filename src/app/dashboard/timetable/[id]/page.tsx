"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Generation, TimetableSlot, Section } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function TimetableViewPage() {
  const params = useParams();
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, [params.id]);

  const loadTimetable = async () => {
    try {
      const data = await api.timetable.getOne(params.id as string);
      setGeneration(data);
      
      // Extract unique sections
      const uniqueSections = Array.from(
        new Set(
          data.slots?.map((s: TimetableSlot) => 
            typeof s.sectionId === "object" ? s.sectionId._id : s.sectionId
          ) || []
        )
      );
      
      const sectionObjects = data.slots
        ?.filter((s: TimetableSlot) => typeof s.sectionId === "object")
        .map((s: TimetableSlot) => s.sectionId as Section)
        .filter((s: Section, i: number, arr: Section[]) => 
          arr.findIndex(x => x._id === s._id) === i
        ) || [];
      
      setSections(sectionObjects);
      if (sectionObjects.length > 0) {
        setSelectedSection(sectionObjects[0]._id);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!confirm("Activate this timetable? This will deactivate all others.")) return;
    try {
      await api.timetable.activate(params.id as string);
      loadTimetable();
      alert("Timetable activated successfully");
    } catch (error: any) {
      alert(error.message || "Failed to activate timetable");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!generation) return <div className="p-6">Timetable not found</div>;

  const sectionSlots = generation.slots?.filter(
    (s) => (typeof s.sectionId === "object" ? s.sectionId._id : s.sectionId) === selectedSection
  ) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{generation.name}</h1>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded ${
            generation.status === 'active' ? 'bg-green-500 text-white' :
            generation.status === 'draft' ? 'bg-yellow-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {generation.status.toUpperCase()}
          </span>
          {generation.status !== 'active' && (
            <Button onClick={handleActivate}>Activate</Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Total Slots</div>
          <div className="text-2xl font-bold">{generation.slots?.length || 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Conflicts</div>
          <div className="text-2xl font-bold">{generation.conflicts?.length || 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Sections</div>
          <div className="text-2xl font-bold">{sections.length}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Generation Time</div>
          <div className="text-2xl font-bold">{generation.generationTime?.toFixed(2)}s</div>
        </div>
      </div>

      {/* Conflicts */}
      {generation.conflicts && generation.conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <h3 className="font-semibold text-red-800 mb-2">Conflicts Detected:</h3>
          {generation.conflicts.map((c, i) => (
            <div key={i} className="text-sm text-red-700 mb-1">
              [{c.severity.toUpperCase()}] {c.message}
            </div>
          ))}
        </div>
      )}

      {/* Section Selector */}
      <div className="bg-white p-4 rounded shadow">
        <label className="font-semibold mr-3">Select Section:</label>
        <select
          className="border rounded px-3 py-2"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          {sections.map((s) => (
            <option key={s._id} value={s._id}>
              {s.code} - {s.name || s.branch}
            </option>
          ))}
        </select>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3 text-left">Period</th>
              {generation.config.days.map((day) => (
                <th key={day} className="border p-3 text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: generation.config.periodsPerDay }, (_, i) => i + 1).map((period) => (
              <tr key={period}>
                <td className="border p-3 font-semibold bg-gray-50">{period}</td>
                {generation.config.days.map((day) => {
                  const slot = sectionSlots.find((s) => s.day === day && s.period === period);
                  
                  return (
                    <td key={day} className="border p-3 text-center">
                      {slot ? (
                        <div className="bg-blue-100 p-2 rounded">
                          <div className="font-semibold text-sm">
                            {typeof slot.subjectId === "object" ? slot.subjectId.code : "?"}
                          </div>
                          <div className="text-xs text-gray-600">
                            {typeof slot.teacherId === "object" ? slot.teacherId.name : "?"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}