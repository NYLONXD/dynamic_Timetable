"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/utils";
import { Department } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { code: "", name: "" };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setDepartments(await api.departments.getAll());
    } catch (error) {
      console.error(error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.departments.update(editingId, form);
        toast.success("Department updated successfully");
      } else {
        await api.departments.create(form);
        toast.success("Department created successfully");
      }
      handleDialogChange(false);
      loadDepartments();
    } catch (error) {
      toast.error(errorMessage(error, `Failed to ${editingId ? "update" : "create"} department`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (department: Department) => {
    setForm({ code: department.code, name: department.name });
    setEditingId(department._id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.departments.delete(id);
      loadDepartments();
      toast.success("Department deleted successfully");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete department"));
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setForm(emptyForm);
      setEditingId(null);
    }
  };

  const filtered = departments.filter(
    (d) => d.code.toLowerCase().includes(search.toLowerCase()) || d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Group sections, teachers and rooms by department.</p>
        </div>

        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Department</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Department" : "Add Department"}</DialogTitle>
              <DialogDescription>A short code (e.g. CSE) and the full name.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" required placeholder="CSE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required placeholder="Computer Science and Engineering" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update Department" : "Save Department"}
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
            <Input placeholder="Search departments..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="h-12 px-4 align-middle">Code</th>
                <th className="h-12 px-4 align-middle">Name</th>
                <th className="h-12 px-4 align-middle text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={3} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="h-32 text-center text-muted-foreground">No departments yet. Add one to get started.</td></tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d._id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-mono font-medium">{d.code}</td>
                    <td className="p-4">{d.name}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(d)} className="text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(d._id)} className="text-muted-foreground hover:text-destructive">
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
