"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { docOf, errorMessage, idOf } from "@/lib/utils";
import { Assignment, Room, Section, Subject, Teacher } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Loader2, BookOpen, Users, Layers, Filter, AlertCircle, CheckCircle2, Clock, Edit, Link2, Pin } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  sectionIds: [] as string[],
  subjectId: "",
  teacherId: "",
  sessions: { perWeek: 3, length: 1 },
  constraint: "hard" as "hard" | "soft",
  priority: 5,
  batch: "",
  parallelGroup: "",
  roomId: "",
  studentCount: "" as number | "",
};

// "CSE3-A + CSE3-B" for a combined class, "CSE3-A B1" for a batch
const sectionsLabel = (a: Pick<Assignment, "sectionIds" | "batch">) =>
  a.sectionIds.map((s) => docOf(s)?.code ?? "?").join(" + ") + (a.batch ? ` ${a.batch}` : "");

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterConstraint, setFilterConstraint] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, sectionsData, subjectsData, teachersData, roomsData] = await Promise.all([
        api.assignments.getAll(),
        api.sections.getAll(),
        api.subjects.getAll(),
        api.teachers.getAll(),
        api.rooms.getAll(),
      ]);
      setAssignments(assignmentsData);
      setSections(sectionsData);
      setSubjects(subjectsData);
      setTeachers(teachersData);
      setRooms(roomsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.sectionIds.length === 0) {
      toast.error("Select at least one section");
      return;
    }
    setIsSubmitting(true);
    try {
      // Empty optional fields are sent as null, which also clears them on update
      const data = {
        ...form,
        batch: form.batch || null,
        parallelGroup: form.parallelGroup.trim() || null,
        roomId: form.roomId || null,
        studentCount: form.studentCount === "" ? null : form.studentCount,
      };
      if (editingId) {
        await api.assignments.update(editingId, data);
        toast.success("Assignment updated successfully");
      } else {
        await api.assignments.create(data);
        toast.success("Assignment created successfully");
      }
      resetForm();
      setOpen(false);
      loadData();
    } catch (error) {
      toast.error(errorMessage(error, `Failed to ${editingId ? "update" : "create"} assignment`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setForm({
      sectionIds: assignment.sectionIds.map(idOf),
      subjectId: idOf(assignment.subjectId),
      teacherId: idOf(assignment.teacherId),
      sessions: assignment.sessions,
      constraint: assignment.constraint,
      priority: assignment.priority || 5,
      batch: assignment.batch ?? "",
      parallelGroup: assignment.parallelGroup ?? "",
      roomId: idOf(assignment.roomId),
      studentCount: assignment.studentCount ?? "",
    });
    setEditingId(assignment._id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.assignments.delete(id);
      loadData();
      toast.success("Assignment deleted successfully");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete assignment"));
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const toggleSection = (id: string) => {
    const sectionIds = form.sectionIds.includes(id) ? form.sectionIds.filter((s) => s !== id) : [...form.sectionIds, id];
    // A batch only makes sense for a single section
    setForm({ ...form, sectionIds, batch: sectionIds.length === 1 ? form.batch : "" });
  };

  const selectSubject = (subjectId: string) => {
    const subject = subjects.find((s) => s._id === subjectId);
    const length = subject?.defaultSessionLength ?? form.sessions.length;
    setForm({ ...form, subjectId, sessions: { ...form.sessions, length } });
  };

  // Batches the batch picker offers: those of the one selected section
  const singleSection = form.sectionIds.length === 1 ? sections.find((s) => s._id === form.sectionIds[0]) : undefined;
  const existingGroups = [...new Set(assignments.map((a) => a.parallelGroup).filter((g): g is string => !!g))];

  const filteredAssignments = assignments.filter(a => {
    const text = [
      sectionsLabel(a),
      docOf(a.subjectId)?.name,
      docOf(a.subjectId)?.code,
      docOf(a.teacherId)?.name,
      a.parallelGroup,
    ].join(" ").toLowerCase();
    const matchesFilter = filterConstraint === "all" || a.constraint === filterConstraint;
    return text.includes(search.toLowerCase()) && matchesFilter;
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
          <p className="text-muted-foreground mt-1">Who teaches which subject to which sections, and how often</p>
        </div>

        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Assignment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Assignment" : "Create New Assignment"}</DialogTitle>
              <DialogDescription>
                Pick several sections for a combined class, or one section and a batch for a split lab.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>
                  Sections <span className="text-xs font-normal text-muted-foreground">({form.sectionIds.length} selected)</span>
                </Label>
                <div className="max-h-40 overflow-y-auto rounded-md border p-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {sections.map((s) => (
                    <label key={s._id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent cursor-pointer">
                      <input type="checkbox" checked={form.sectionIds.includes(s._id)} onChange={() => toggleSection(s._id)} className="rounded border-gray-300" />
                      <span className="font-medium">{s.code}</span>
                      {s.strength ? <span className="text-xs text-muted-foreground">{s.strength}</span> : null}
                    </label>
                  ))}
                  {sections.length === 0 && <p className="text-sm text-muted-foreground p-2">No sections yet.</p>}
                </div>
                {form.sectionIds.length > 1 && (
                  <p className="text-xs text-muted-foreground">Combined class: all selected sections attend together.</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <select
                    required
                    className="w-full h-9 rounded-md border px-3 text-sm"
                    value={form.subjectId}
                    onChange={(e) => selectSubject(e.target.value)}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.code} - {s.name}{s.category === "lab" ? " (lab)" : ""}
                      </option>
                    ))}
                  </select>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Batch</Label>
                  <select
                    className="w-full h-9 rounded-md border px-3 text-sm disabled:opacity-50"
                    value={form.batch}
                    disabled={!singleSection?.batches.length}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  >
                    <option value="">Whole section</option>
                    {singleSection?.batches.map((b) => (
                      <option key={b} value={b}>Batch {b} only</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">For one section that is split into batches.</p>
                </div>

                <div className="space-y-2">
                  <Label>Parallel group</Label>
                  <Input
                    list="parallel-groups"
                    placeholder="e.g. CSE3A-LAB or OE-1"
                    value={form.parallelGroup}
                    onChange={(e) => setForm({ ...form, parallelGroup: e.target.value })}
                  />
                  <datalist id="parallel-groups">
                    {existingGroups.map((g) => <option key={g} value={g} />)}
                  </datalist>
                  <p className="text-xs text-muted-foreground">Same label = scheduled at the same times (lab batches, electives).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room</Label>
                  <select
                    className="w-full h-9 rounded-md border px-3 text-sm"
                    value={form.roomId}
                    onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  >
                    <option value="">Any suitable room</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.code} ({r.type}, {r.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Expected students</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Everyone in the sections"
                    value={form.studentCount}
                    onChange={(e) => setForm({ ...form, studentCount: e.target.value ? parseInt(e.target.value) : "" })}
                  />
                  <p className="text-xs text-muted-foreground">Set this for electives, so a smaller room can be used.</p>
                </div>
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
                  <Label>Session Length (periods)</Label>
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
                    onChange={(e) => setForm({ ...form, constraint: e.target.value as typeof form.constraint })}
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
              placeholder="Search by section, subject, teacher or group..."
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
                <th className="h-12 px-4 align-middle">Sections</th>
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
                          <div className="font-medium">{sectionsLabel(a)}</div>
                          <div className="text-xs text-muted-foreground">
                            {a.sectionIds.length > 1 ? "Combined class" : a.batch ? "Batch only" : docOf(a.sectionIds[0])?.branch}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{docOf(a.subjectId)?.name ?? "?"}</div>
                          <div className="text-xs text-muted-foreground font-mono">{docOf(a.subjectId)?.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{docOf(a.teacherId)?.name ?? "?"}</div>
                          <div className="text-xs text-muted-foreground font-mono">{docOf(a.teacherId)?.staffId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {a.sessions.perWeek}x/week
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          {a.sessions.length} period{a.sessions.length > 1 ? "s" : ""} each
                        </span>
                        {a.parallelGroup && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" title="Scheduled at the same times as the rest of its group">
                            <Link2 className="h-3 w-3" /> {a.parallelGroup}
                          </span>
                        )}
                        {docOf(a.roomId) && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary" title="Always in this room">
                            <Pin className="h-3 w-3" /> {docOf(a.roomId)?.code}
                          </span>
                        )}
                        {a.studentCount ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary">
                            {a.studentCount} students
                          </span>
                        ) : null}
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
