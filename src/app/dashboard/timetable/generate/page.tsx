"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Assignment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Calendar, Settings, CheckSquare, Square, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
      toast.error("Failed to load assignments");
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
      toast.error("Please select at least one assignment");
      return;
    }

    setLoading(true);
    try {
      const result = await api.timetable.generate({
        name: form.name,
        config: form.config,
        assignmentIds: selectedAssignments,
      });
      toast.success("Timetable generated successfully!");
      router.push(`/dashboard/timetable/${result._id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate timetable");
    } finally {
      setLoading(false);
    }
  };

  const toggleAll = () => {
    if (selectedAssignments.length === assignments.length) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(assignments.map((a) => a._id));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/timetable">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Timetable</h1>
          <p className="text-muted-foreground mt-1">Configure and create a new academic schedule</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Configuration
            </CardTitle>
            <CardDescription>Set the name and schedule parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timetable Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Spring 2024 - Final Schedule"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label>Max Consecutive</Label>
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
                <p className="text-xs text-muted-foreground">Max classes before break</p>
              </div>

              <div className="space-y-2">
                <Label>Lunch Period</Label>
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
            </div>

            <div className="space-y-2">
              <Label>Working Days</Label>
              <div className="flex flex-wrap gap-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                  <label key={day} className="flex items-center gap-2 cursor-pointer">
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
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Select Assignments
                </CardTitle>
                <CardDescription>Choose which subject assignments to include</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
                {selectedAssignments.length === assignments.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No assignments found. Create assignments first.
                </div>
              ) : (
                assignments.map((a) => (
                  <label
                    key={a._id}
                    className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="pt-1">
                      {selectedAssignments.includes(a._id) ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                      ) : (
                        <Square className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedAssignments.includes(a._id)}
                      onChange={() => toggleAssignment(a._id)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {typeof a.sectionId === "object" ? a.sectionId.code : "?"}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">
                          {typeof a.subjectId === "object" ? a.subjectId.name : "?"}
                        </span>
                        <span className="text-xs text-muted-foreground">by</span>
                        <span className="text-sm">
                          {typeof a.teacherId === "object" ? a.teacherId.name : "?"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{a.sessions.perWeek} classes/week</span>
                        <span>•</span>
                        <span>{a.sessions.length}h each</span>
                        <span>•</span>
                        <span className={a.constraint === "hard" ? "text-red-600" : "text-green-600"}>
                          {a.constraint} constraint
                        </span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
              <strong className="text-blue-700 dark:text-blue-300">
                {selectedAssignments.length} of {assignments.length}
              </strong>{" "}
              <span className="text-blue-600 dark:text-blue-400">assignments selected</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/timetable")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || selectedAssignments.length === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Timetable
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}