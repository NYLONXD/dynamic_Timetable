"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Section } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Plus, Search, Trash2, Loader2, Users, BookOpen } from "lucide-react"

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false) // Dialog state
  const [search, setSearch] = useState("")

  // Form State
  const [form, setForm] = useState({
    code: "",
    name: "",
    semester: 1,
    branch: "",
    strength: 60,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      // In a real app, use a toast here
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.sections.create(form)
      setForm({ code: "", name: "", semester: 1, branch: "", strength: 60 })
      setOpen(false) // Close dialog
      loadSections()
      alert("Section created successfully")
    } catch (error: any) {
      alert(error.message || "Failed to create section")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section? This action cannot be undone.")) return
    try {
      await api.sections.delete(id)
      loadSections()
    } catch (error: any) {
      alert(error.message || "Failed to delete section")
    }
  }

  // Filter sections based on search
  const filteredSections = sections.filter(s => 
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.branch.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Sections</h1>
            <p className="text-muted-foreground">Manage your class sections and student capacities.</p>
         </div>
         
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
               <Button className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Section
               </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Add New Section</DialogTitle>
                  <DialogDescription>
                     Create a new section for a specific branch and semester.
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
                        Create Section
                     </Button>
                  </DialogFooter>
               </form>
            </DialogContent>
         </Dialog>
      </div>
      
      {/* Stats Overview */}
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

      {/* Main Content Table */}
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
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="text-muted-foreground hover:text-destructive"
                                 onClick={() => handleDelete(s._id)}
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
  )
}