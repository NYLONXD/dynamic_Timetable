"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Section } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Plus, Search, Trash2, Loader2, Users, BookOpen, Edit } from "lucide-react"
import { toast } from "sonner"

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    code: "",
    name: "",
    semester: 1,
    branch: "",
    strength: 60,
  })

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      setLoading(true)
      const data = await api.sections.getAll()
      setSections(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load sections")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({ code: "", name: "", semester: 1, branch: "", strength: 60 })
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await api.sections.update(editingId, form)
        toast.success("Section updated successfully")
      } else {
        await api.sections.create(form)
        toast.success("Section created successfully")
      }
      resetForm()
      setOpen(false)
      loadSections()
    } catch (error: any) {
      toast.error(error.message || `Failed to ${editingId ? "update" : "create"} section`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (section: Section) => {
    setForm({
      code: section.code,
      name: section.name || "",
      semester: section.semester,
      branch: section.branch,
      strength: section.strength || 60,
    })
    setEditingId(section._id)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await api.sections.delete(id)
      loadSections()
      toast.success("Section deleted successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete section")
    }
  }

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      resetForm()
    }
  }

  const filteredSections = sections.filter(s => 
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.branch.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Sections</h1>
            <p className="text-muted-foreground">Manage your class sections and student capacities.</p>
         </div>
         
         <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
               <Button className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Section
               </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Section" : "Add New Section"}</DialogTitle>
                  <DialogDescription>
                     {editingId ? "Update section details" : "Create a new section for a specific branch and semester"}
                  </DialogDescription>
               </DialogHeader>
               <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="code" className="text-right">Code</Label>
                     <Input
                        id="code"
                        placeholder="CSE-A"
                        className="col-span-3"
                        required
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                     />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="branch" className="text-right">Branch</Label>
                     <Input
                        id="branch"
                        placeholder="Computer Science"
                        className="col-span-3"
                        required
                        value={form.branch}
                        onChange={(e) => setForm({ ...form, branch: e.target.value })}
                     />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="semester" className="text-right">Sem</Label>
                     <Input
                        id="semester"
                        type="number"
                        min="1"
                        max="8"
                        className="col-span-3"
                        required
                        value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) })}
                     />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="strength" className="text-right">Capacity</Label>
                     <Input
                        id="strength"
                        type="number"
                        className="col-span-3"
                        value={form.strength}
                        onChange={(e) => setForm({ ...form, strength: parseInt(e.target.value) })}
                     />
                  </div>
                  <DialogFooter>
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingId ? "Update Section" : "Create Section"}
                     </Button>
                  </DialogFooter>
               </form>
            </DialogContent>
         </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
               <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{sections.length}</div>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
               <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">
                  {sections.reduce((acc, curr) => acc + (curr.strength || 0), 0)}
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border shadow-sm">
         <div className="p-4 flex items-center gap-4 border-b">
            <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input 
                  placeholder="Search by code or branch..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>
         </div>
         
         <div className="relative w-full overflow-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-muted/50 text-muted-foreground font-medium">
                  <tr>
                     <th className="h-12 px-4 align-middle">Code</th>
                     <th className="h-12 px-4 align-middle">Branch</th>
                     <th className="h-12 px-4 align-middle">Semester</th>
                     <th className="h-12 px-4 align-middle">Strength</th>
                     <th className="h-12 px-4 align-middle text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y">
                  {loading ? (
                     <tr>
                        <td colSpan={5} className="h-24 text-center">
                           <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </td>
                     </tr>
                  ) : filteredSections.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="h-32 text-center text-muted-foreground">
                           No sections found. Add one to get started.
                        </td>
                     </tr>
                  ) : (
                     filteredSections.map((s) => (
                        <tr key={s._id} className="hover:bg-muted/50 transition-colors">
                           <td className="p-4 font-medium">{s.code}</td>
                           <td className="p-4">{s.branch}</td>
                           <td className="p-4">
                              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                                 Sem {s.semester}
                              </span>
                           </td>
                           <td className="p-4 text-muted-foreground">{s.strength || "-"} students</td>
                           <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground"
                                    onClick={() => handleEdit(s)}
                                 >
                                    <Edit className="h-4 w-4" />
                                 </Button>
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(s._id)}
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
  )
}