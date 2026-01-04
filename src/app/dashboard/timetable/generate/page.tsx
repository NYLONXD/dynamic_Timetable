"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Assignment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GenerateTimetablePage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    config: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      periodsPerDay: 7,
      maxConsecutive: 2,
      breakPeriods: [] as number[],
      lunchPeriod: 4,
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await api.assignments.getAll();
      setAssignments(data);
      setSelectedAssignments(data.map((a: Assignment) => a._id));
    } catch (error) {
      console.error(error);
      alert("Failed to load assignments");
    }
  };

  const toggleAssignment = (id: string) => {
    setSelectedAssignments((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedAssignments.length === 0) {
      alert("Please select at least one assignment");
      return;
    }

    setLoading(true);
    try {
      const result = await api.timetable.generate({
        name: form.name,
        config: form.config,
        assignmentIds: selectedAssignments,
      });
      alert("Timetable generated successfully!");
      router.push(`/dashboard/timetable/${result._id}`);
    } catch (error: any) {
      alert(error.message || "Failed to generate timetable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Generate Timetable</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Configuration</h2>

        <div>
          <Label>Timetable Name</Label>
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Spring 2024 - Version 1"
          />
        </div>

        <div>
          <Label>Periods Per Day</Label>
          <Input
            required
            type="number"
            min="1"
            max="12"
            value={form.config.periodsPerDay}
            onChange={(e) =>
              setForm({
                ...form,
                config: { ...form.config, periodsPerDay: parseInt(e.target.value) },
              })
            }
          />
        </div>

        <div>
          <Label>Max Consecutive Classes (before break)</Label>
          <Input
            required
            type="number"
            min="1"
            max="5"
            value={form.config.maxConsecutive}
            onChange={(e) =>
              setForm({
                ...form,
                config: { ...form.config, maxConsecutive: parseInt(e.target.value) },
              })
            }
          />
        </div>

        <div>
          <Label>Lunch Period (Optional)</Label>
          <Input
            type="number"
            min="1"
            value={form.config.lunchPeriod}
            onChange={(e) =>
              setForm({
                ...form,
                config: { ...form.config, lunchPeriod: parseInt(e.target.value) },
              })
            }
          />
        </div>

        <div>
          <Label>Working Days</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
              <label key={day} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.config.days.includes(day)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm({
                        ...form,
                        config: { ...form.config, days: [...form.config.days, day] },
                      });
                    } else {
                      setForm({
                        ...form,
                        config: {
                          ...form.config,
                          days: form.config.days.filter((d) => d !== day),
                        },
                      });
                    }
                  }}
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-6">Select Assignments</h2>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedAssignments.length === assignments.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedAssignments(assignments.map((a: Assignment) => a._id));
                } else {
                  setSelectedAssignments([]);
                }
              }}
            />
            <span className="font-semibold">Select All</span>
          </label>
          
          {assignments.map((a: Assignment) => (
            <label key={a._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAssignments.includes(a._id)}
                onChange={() => toggleAssignment(a._id)}
              />
              <span>
                {typeof a.sectionId === "object" ? a.sectionId.code : "?"} →{" "}
                {typeof a.subjectId === "object" ? a.subjectId.name : "?"} by{" "}
                {typeof a.teacherId === "object" ? a.teacherId.name : "?"}
                {" "}({a.sessions.perWeek} classes/week)
              </span>
            </label>
          ))}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Generating..." : "Generate Timetable"}
        </Button>
      </form>
    </div>
  );
}