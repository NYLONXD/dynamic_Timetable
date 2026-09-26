"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { docOf, errorMessage, idOf } from "@/lib/utils";
import { Assignment, Department, Term } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Settings, CheckSquare, Square, Zap, ArrowLeft, CalendarRange, Link2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Departments an assignment belongs to: those of its sections
const departmentsOf = (a: Assignment) => a.sectionIds.map((s) => idOf(docOf(s)?.departmentId));

export default function GenerateTimetablePage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [form, setForm] = useState({ name: "", termId: "", maxConsecutive: 3 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsData, termsData, departmentsData] = await Promise.all([
        api.assignments.getAll(),
        api.terms.getAll(),
        api.departments.getAll(),
      ]);
      setAssignments(assignmentsData);
      setTerms(termsData);
      setDepartments(departmentsData);
      setSelectedAssignments(assignmentsData.map((a: Assignment) => a._id));
      setForm((f) => ({ ...f, termId: termsData[0]?._id ?? "" }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignments");
    }
  };

  const visible = departmentId ? assignments.filter((a) => departmentsOf(a).includes(departmentId)) : assignments;
  const selectedVisible = selectedAssignments.filter((id) => visible.some((a) => a._id === id));
  const term = terms.find((t) => t._id === form.termId);

  const chooseDepartment = (id: string) => {
    setDepartmentId(id);
    const shown = id ? assignments.filter((a) => departmentsOf(a).includes(id)) : assignments;
    setSelectedAssignments(shown.map((a) => a._id));
  };

  const toggleAssignment = (id: string) => {
    setSelectedAssignments((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedAssignments(selectedVisible.length === visible.length ? [] : visible.map((a) => a._id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedVisible.length === 0) {
      toast.error("Please select at least one assignment");
      return;
    }

    setLoading(true);
    try {
      const result = await api.timetable.generate({
        name: form.name,
        termId: form.termId,
        maxConsecutive: form.maxConsecutive,
        assignmentIds: selectedVisible,
      });
      toast.success("Timetable generated successfully!");
      router.push(`/dashboard/timetable/${result._id}`);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to generate timetable"));
    } finally {
      setLoading(false);
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
          <p className="text-muted-foreground mt-1">Schedule a department (or the whole institution) for a term</p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Generating timetable...</p>
          <p className="text-sm text-muted-foreground mt-2">This usually takes a few seconds</p>
        </div>
      )}

      {!loading && terms.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-10 text-center gap-3">
            <CalendarRange className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Set up a term first</p>
            <p className="text-sm text-muted-foreground max-w-md">
              A term holds the bell schedule (working days, periods, breaks) that every timetable in it uses.
            </p>
            <Link href="/dashboard/terms">
              <Button>Go to Terms</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!loading && terms.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Configuration
            </CardTitle>
            <CardDescription>Days, periods and breaks come from the term</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timetable Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., CSE - Odd Semester v1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Term</Label>
                <select
                  required
                  className="w-full h-9 rounded-md border px-3 text-sm"
                  value={form.termId}
                  onChange={(e) => setForm({ ...form, termId: e.target.value })}
                >
                  {terms.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <select
                  className="w-full h-9 rounded-md border px-3 text-sm"
                  value={departmentId}
                  onChange={(e) => chooseDepartment(e.target.value)}
                >
                  <option value="">All departments</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Max Consecutive</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  max="5"
                  value={form.maxConsecutive}
                  onChange={(e) => setForm({ ...form, maxConsecutive: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-muted-foreground">Most classes in a row before a free period</p>
              </div>
            </div>

            {term && (
              <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
                <div>
                  <span className="font-medium">{term.days.length} days</span>{" "}
                  <span className="text-muted-foreground">({term.days.map((d) => d.slice(0, 3)).join(", ")})</span>
                  {" · "}
                  <span className="font-medium">{term.periodsPerDay} periods</span>
                  {term.lunchPeriod ? ` · lunch in period ${term.lunchPeriod}` : ""}
                  {term.breakPeriods.length ? ` · breaks in ${term.breakPeriods.join(", ")}` : ""}
                  {term.periodTimes.length ? ` · ${term.periodTimes[0].start}–${term.periodTimes[term.periodTimes.length - 1].end}` : ""}
                </div>
                <p className="text-xs text-muted-foreground">
                  Teachers and rooms used by this term&apos;s active timetables for other sections are left free.
                </p>
              </div>
            )}
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
                {selectedVisible.length === visible.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {visible.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {departmentId ? "No assignments for this department's sections." : "No assignments found. Create assignments first."}
                </div>
              ) : (
                visible.map((a) => (
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
                          {a.sectionIds.map((s) => docOf(s)?.code ?? "?").join(" + ")}
                          {a.batch ? ` ${a.batch}` : ""}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{docOf(a.subjectId)?.name ?? "?"}</span>
                        <span className="text-xs text-muted-foreground">by</span>
                        <span className="text-sm">{docOf(a.teacherId)?.name ?? "?"}</span>
                        {a.parallelGroup && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            <Link2 className="h-3 w-3" /> {a.parallelGroup}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{a.sessions.perWeek} classes/week</span>
                        <span>•</span>
                        <span>{a.sessions.length} period{a.sessions.length > 1 ? "s" : ""} each</span>
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
                {selectedVisible.length} of {visible.length}
              </strong>{" "}
              <span className="text-blue-600 dark:text-blue-400">assignments selected</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/timetable")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || selectedVisible.length === 0 || !form.termId}>
            <Zap className="mr-2 h-4 w-4" />
            Generate Timetable
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}
