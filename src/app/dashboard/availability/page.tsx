"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Teacher, TeacherAvailability } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Loader2, Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function TeacherAvailabilityPage() {
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    teacherId: "",
    day: "Monday" as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday",
    period: 1,
    type: "unavailable" as "unavailable" | "preferred",
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [availData, teachersData] = await Promise.all([
        api.availability.getAll(),
        api.teachers.getAll(),
      ]);
      setAvailability(availData);
      setTeachers(teachersData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.availability.create(form);
      setForm({
        teacherId: "",
        day: "Monday",
        period: 1,
        type: "unavailable",
        reason: "",
      });
      setOpen(false);
      loadData();
      toast.success("Availability record created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create availability record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.availability.delete(id);
      loadData();
      toast.success("Availability record deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete availability record");
    }
  };

  const filteredAvailability = availability.filter(a => {
    const teacherName = typeof a.teacherId === "object" ? a.teacherId.name : "";
    const matchesSearch = teacherName.toLowerCase().includes(search.toLowerCase()) || 
                         a.day.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === "all" || a.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: availability.length,
    unavailable: availability.filter(a => a.type === "unavailable").length,
    preferred: availability.filter(a => a.type === "preferred").length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Availability</h1>
          <p className="text-muted-foreground mt-1">Manage when teachers are unavailable or prefer certain slots</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Availability</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Availability Record</DialogTitle>
              <DialogDescription>Mark when a teacher is unavailable or prefers a time slot</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Day</Label>
                  <select
                    className="w-full h-9 rounded-md border px-3 text-sm"
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value as any })}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Period</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="w-full h-9 rounded-md border px-3 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                >
                  <option value="unavailable">Unavailable (Hard Constraint)</option>
                  <option value="preferred">Preferred (Soft Constraint)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Unavailable = Cannot teach at this time. Preferred = Would like to teach at this time.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Input
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="e.g., Department meeting"
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Availability
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="p-6 flex flex-row items-center justify-between space-y-0">
            <div className="text-sm font-medium">Total Records</div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="px-6 pb-6">
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
        </Card>

        <Card>
          <div className="p-6 flex flex-row items-center justify-between space-y-0">
            <div className="text-sm font-medium">Unavailable</div>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="px-6 pb-6">
            <div className="text-2xl font-bold">{stats.unavailable}</div>
            <p className="text-xs text-muted-foreground mt-1">Hard constraints</p>
          </div>
        </Card>

        <Card>
          <div className="p-6 flex flex-row items-center justify-between space-y-0">
            <div className="text-sm font-medium">Preferred</div>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div className="px-6 pb-6">
            <div className="text-2xl font-bold">{stats.preferred}</div>
            <p className="text-xs text-muted-foreground mt-1">Soft constraints</p>
          </div>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row gap-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by teacher or day..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="all">All Types</option>
            <option value="unavailable">Unavailable Only</option>
            <option value="preferred">Preferred Only</option>
          </select>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="h-12 px-4 align-middle">Teacher</th>
                <th className="h-12 px-4 align-middle">Day</th>
                <th className="h-12 px-4 align-middle">Period</th>
                <th className="h-12 px-4 align-middle">Type</th>
                <th className="h-12 px-4 align-middle">Reason</th>
                <th className="h-12 px-4 align-middle text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filteredAvailability.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-muted-foreground">
                    No availability records found.
                  </td>
                </tr>
              ) : (
                filteredAvailability.map((a) => (
                  <tr key={a._id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">
                        {typeof a.teacherId === "object" ? a.teacherId.name : a.teacherId}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {typeof a.teacherId === "object" ? a.teacherId.staffId : ""}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {a.day}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Period {a.period}
                      </div>
                    </td>
                    <td className="p-4">
                      {a.type === "unavailable" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unavailable
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Preferred
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{a.reason || "-"}</td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(a._id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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