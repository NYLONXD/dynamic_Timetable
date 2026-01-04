"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Teacher } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Loader2, Mail, Clock } from "lucide-react";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    staffId: "",
    name: "",
    email: "",
    department: "",
    maxHoursPerDay: 6,
    maxHoursPerWeek: 30,
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await api.teachers.getAll();
      setTeachers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.teachers.create(form);
      setForm({ staffId: "", name: "", email: "", department: "", maxHoursPerDay: 6, maxHoursPerWeek: 30 });
      setOpen(false);
      loadTeachers();
    } catch (error: any) {
      alert(error.message || "Failed to create teacher");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    try {
      await api.teachers.delete(id);
      loadTeachers();
    } catch (error: any) {
      alert(error.message || "Failed to delete teacher");
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.staffId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">Manage faculty members and their workload limits.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Teacher</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>Register a new faculty member to the system.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="staffId">Staff ID</Label>
                    <Input id="staffId" value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} required placeholder="EMP001" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" />
                 </div>
              </div>
              <div className="space-y-2">
                 <Label htmlFor="name">Full Name</Label>
                 <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Dr. John Doe" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="email">Email Address</Label>
                 <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@institute.edu" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                 <div className="space-y-2">
                    <Label htmlFor="maxDay">Max Hrs/Day</Label>
                    <Input id="maxDay" type="number" min="1" value={form.maxHoursPerDay} onChange={(e) => setForm({ ...form, maxHoursPerDay: parseInt(e.target.value) })} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="maxWeek">Max Hrs/Week</Label>
                    <Input id="maxWeek" type="number" min="1" value={form.maxHoursPerWeek} onChange={(e) => setForm({ ...form, maxHoursPerWeek: parseInt(e.target.value) })} />
                 </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Save Teacher
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-sm">
        <div className="p-4 border-b">
           <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search teachers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
           </div>
        </div>
        <div className="overflow-auto">
           <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium">
                 <tr>
                    <th className="h-12 px-4 align-middle">Staff ID</th>
                    <th className="h-12 px-4 align-middle">Name</th>
                    <th className="h-12 px-4 align-middle">Contact</th>
                    <th className="h-12 px-4 align-middle">Dept</th>
                    <th className="h-12 px-4 align-middle">Workload Limits</th>
                    <th className="h-12 px-4 align-middle text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y">
                 {loading ? (
                    <tr><td colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                 ) : filteredTeachers.length === 0 ? (
                    <tr><td colSpan={6} className="h-32 text-center text-muted-foreground">No teachers found.</td></tr>
                 ) : (
                    filteredTeachers.map((t) => (
                       <tr key={t._id} className="hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-mono text-xs text-muted-foreground">{t.staffId}</td>
                          <td className="p-4 font-medium">{t.name}</td>
                          <td className="p-4">
                             {t.email ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                   <Mail className="h-3 w-3" /> <span className="text-xs">{t.email}</span>
                                </div>
                             ) : "-"}
                          </td>
                          <td className="p-4">{t.department || "-"}</td>
                          <td className="p-4">
                             <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded">
                                   <Clock className="h-3 w-3" /> {t.maxHoursPerDay}h/day
                                </span>
                                <span className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded">
                                   <Clock className="h-3 w-3" /> {t.maxHoursPerWeek}h/wk
                                </span>
                             </div>
                          </td>
                          <td className="p-4 text-right">
                             <Button variant="ghost" size="icon" onClick={() => handleDelete(t._id)} className="text-muted-foreground hover:text-destructive">
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