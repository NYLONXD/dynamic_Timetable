"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Loader2, Book, FlaskConical, Presentation, Users } from "lucide-react";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "theory" as "theory" | "lab" | "seminar" | "tutorial",
    defaultCredits: 3,
    requiresConsecutive: false,
    defaultSessionLength: 1,
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await api.subjects.getAll();
      setSubjects(data);
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
      await api.subjects.create(form);
      setForm({
        code: "",
        name: "",
        category: "theory",
        defaultCredits: 3,
        requiresConsecutive: false,
        defaultSessionLength: 1,
      });
      setOpen(false);
      loadSubjects();
    } catch (error: any) {
      alert(error.message || "Failed to create subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject?")) return;
    try {
      await api.subjects.delete(id);
      loadSubjects();
    } catch (error: any) {
      alert(error.message || "Failed to delete subject");
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'lab': return <FlaskConical className="h-3 w-3 mr-1" />;
      case 'seminar': return <Presentation className="h-3 w-3 mr-1" />;
      case 'tutorial': return <Users className="h-3 w-3 mr-1" />;
      default: return <Book className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">Define courses and their credit requirements.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Subject</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>Enter the course details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Code</Label>
                <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="col-span-3" required placeholder="CS101" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-3" required placeholder="Intro to Programming" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Type</Label>
                <select 
                  className="col-span-3 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                >
                  <option value="theory">Theory</option>
                  <option value="lab">Lab (Practical)</option>
                  <option value="seminar">Seminar</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="credits" className="text-right">Credits</Label>
                <Input id="credits" type="number" min="1" value={form.defaultCredits} onChange={(e) => setForm({ ...form, defaultCredits: parseInt(e.target.value) })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <Label className="text-right text-xs text-muted-foreground col-span-1">Options</Label>
                 <div className="col-span-3 flex items-center space-x-2">
                    <input type="checkbox" id="consecutive" className="rounded border-gray-300" checked={form.requiresConsecutive} onChange={(e) => setForm({ ...form, requiresConsecutive: e.target.checked })} />
                    <Label htmlFor="consecutive" className="font-normal text-sm cursor-pointer">Requires consecutive periods?</Label>
                 </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Save Subject
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
              <Input placeholder="Search subjects..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
           </div>
        </div>
        <div className="overflow-auto">
           <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium">
                 <tr>
                    <th className="h-12 px-4 align-middle">Code</th>
                    <th className="h-12 px-4 align-middle">Name</th>
                    <th className="h-12 px-4 align-middle">Category</th>
                    <th className="h-12 px-4 align-middle">Credits</th>
                    <th className="h-12 px-4 align-middle text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y">
                 {loading ? (
                    <tr><td colSpan={5} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                 ) : filteredSubjects.length === 0 ? (
                    <tr><td colSpan={5} className="h-32 text-center text-muted-foreground">No subjects found.</td></tr>
                 ) : (
                    filteredSubjects.map((s) => (
                       <tr key={s._id} className="hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-mono text-xs">{s.code}</td>
                          <td className="p-4 font-medium">{s.name}</td>
                          <td className="p-4">
                             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize 
                                ${s.category === 'lab' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 
                                  s.category === 'theory' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700'}`}>
                                {getCategoryIcon(s.category)}
                                {s.category}
                             </span>
                          </td>
                          <td className="p-4 text-muted-foreground">{s.defaultCredits}</td>
                          <td className="p-4 text-right">
                             <Button variant="ghost" size="icon" onClick={() => handleDelete(s._id)} className="text-muted-foreground hover:text-destructive">
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