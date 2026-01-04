"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Assignment, Section, Subject, Teacher } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Loader2, BookOpen, Users, Layers, Filter, AlertCircle, CheckCircle2, Clock, Edit } from "lucide-react";
import { toast } from "sonner";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterConstraint, setFilterConstraint] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    sectionId: "",
    subjectId: "",
    teacherId: "",
    sessions: { perWeek: 3, length: 1 },
    constraint: "hard" as "hard" | "soft",
    priority: 5,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
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
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      sectionId: "",
      subjectId: "",
      teacherId: "",
      sessions: { perWeek: 3, length: 1 },
      constraint: "hard",
      priority: 5,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.assignments.update(editingId, form);
        toast.success("Assignment updated successfully");
      } else {
        await api.assignments.create(form);
        toast.success("Assignment created successfully");
      }
      resetForm();
      setOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${editingId ? "update" : "create"} assignment`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setForm({
      sectionId: typeof assignment.sectionId === "object" ? assignment.sectionId._id : assignment.sectionId,
      subjectId: typeof assignment.subjectId === "object" ? assignment.subjectId._id : assignment.subjectId,
      teacherId: typeof assignment.teacherId === "object" ? assignment.teacherId._id : assignment.teacherId,
      sessions: assignment.sessions,
      constraint: assignment.constraint,
      priority: assignment.priority || 5,
    });
    setEditingId(assignment._id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.assignments.delete(id);
      loadData();
      toast.success("Assignment deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete assignment");
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = 
      (typeof a.sectionId === "object" && a.sectionId.code.toLowerCase().includes(search.toLowerCase())) ||
      (typeof a.subjectId === "object" && a.subjectId.name.toLowerCase().includes(search.toLowerCase())) ||
      (typeof a.teacherId === "object" && a.teacherId.name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesFilter = filterConstraint === "all" || a.constraint === filterConstraint;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: assignments.length,
    hard: assignments.filter(a => a.constraint === "hard").length,
    soft: assignments.filter(a => a.constraint === "soft").length,
    totalHours: assignments.reduce((acc, a) => acc + (a.sessions.perWeek * a.sessions.length), 0)
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subject Assignments</h1>
          <p className="text-muted-foreground mt-1">Map teachers to subjects for each section</p>
        </div>

        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Assignment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Assignment" : "Create New Assignment"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update assignment details" : "Assign a teacher to teach a subject for a specific section"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section</Label>
                  <select
                    required
                    className="w-full h-9 rounded-md border px-3 text-sm"
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

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <select
                    required
                    className="w-full h-9 rounded-md border px-3 text-sm"
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
              </div>

              <div className="space-y-2">
                <Label>Teacher</Label>
                <select
                  required
                  className="w-full h-9 rounded-md border px-3 text-sm"
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

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
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
                        sessions: { ...form.sessions, perWeek: parseInt(e.target.value) || 1 },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Session Length (hours)</Label>
                  <Input
                    required
                    type="number"
                    min="1"
                    max="4"
                    value={form.sessions.length}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sessions: { ...form.sessions, length: parseInt(e.target.value) || 1 },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">1 for theory, 2-3 for labs</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Constraint Type</Label>
                  <select
                    className="w-full h-9 rounded-md border px-3 text-sm"
                    value={form.constraint}
                    onChange={(e) => setForm({ ...form, constraint: e.target.value as any })}
                  >
                    <option value="hard">Hard (Must Satisfy)</option>
                    <option value="soft">Soft (Try to Satisfy)</option>
                  </select>
                  <p className="text-xs text-muted-foreground">Hard constraints must be satisfied</p>
                </div>

                <div className="space-y-2">
                  <Label>Priority (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 5 })}
                  />
                  <p className="text-xs text-muted-foreground">Higher priority scheduled first</p>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update Assignment" : "Create Assignment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="p-6 flex flex-row items-center justify-between space-y-0">
            <div className="text-sm font-medium">Total Assignments</div>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="px-6 pb-6">
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
        </Card>

        <Card>
          <div className="p-6 flex flex-row items-center justify-between space-y-0">
            <div className="text-sm font-medium">Hard Constraints</div>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="px-6 pb-6">
            <div className="text-2xl font-bold">{stats.hard}</div>
            <p className="text-xs text-muted-foreground mt-1">Must satisfy</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 flex flex-row items-center justify-between space-y-0">
            <div className="text-sm font-medium">Soft Constraints</div>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div className="px-6 pb-6">
            <div className="text-2xl font-bold">{stats.soft}</div>
            <p className="text-xs text-muted-foreground mt-1">Flexible</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 flex flex-row items-center justify-between space-y-0">
            <div className="text-sm font-medium">Total Hours/Week</div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="px-6 pb-6">
            <div className="text-2xl font-bold">{stats.totalHours}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all sections</p>
          </div>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row gap-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by section, subject, or teacher..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterConstraint}
              onChange={(e) => setFilterConstraint(e.target.value)}
              className="h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="all">All Constraints</option>
              <option value="hard">Hard Only</option>
              <option value="soft">Soft Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="h-12 px-4 align-middle">Section</th>
                <th className="h-12 px-4 align-middle">Subject</th>
                <th className="h-12 px-4 align-middle">Teacher</th>
                <th className="h-12 px-4 align-middle">Schedule</th>
                <th className="h-12 px-4 align-middle">Constraint</th>
                <th className="h-12 px-4 align-middle">Priority</th>
                <th className="h-12 px-4 align-middle text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">
                    No assignments found. Create one to get started.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => (
                  <tr key={a._id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {typeof a.sectionId === "object" ? a.sectionId.code : a.sectionId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {typeof a.sectionId === "object" ? a.sectionId.branch : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {typeof a.subjectId === "object" ? a.subjectId.name : a.subjectId}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {typeof a.subjectId === "object" ? a.subjectId.code : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {typeof a.teacherId === "object" ? a.teacherId.name : a.teacherId}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {typeof a.teacherId === "object" ? a.teacherId.staffId : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {a.sessions.perWeek}x/week
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          {a.sessions.length}h each
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {a.constraint === "hard" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Hard
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Soft
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              (a.priority ?? 5) >= 8 ? "bg-red-500" :
                              (a.priority ?? 5) >= 5 ? "bg-yellow-500" :
                              "bg-green-500"
                            }`}
                            style={{ width: `${((a.priority ?? 5) / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{a.priority ?? 5}/10</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(a)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(a._id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}