"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { docOf, errorMessage, idOf } from "@/lib/utils";
import { Department, Room, RoomType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Loader2, Edit, DoorOpen, FlaskConical, Users, Filter } from "lucide-react";
import { toast } from "sonner";

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "lecture", label: "Lecture room" },
  { value: "lab", label: "Lab" },
  { value: "seminar", label: "Seminar room" },
];

const emptyForm = { code: "", name: "", building: "", type: "lecture" as RoomType, capacity: 60, departmentId: "" };

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, departmentsData] = await Promise.all([api.rooms.getAll(), api.departments.getAll()]);
      setRooms(roomsData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = { ...form, departmentId: form.departmentId || null };
      if (editingId) {
        await api.rooms.update(editingId, data);
        toast.success("Room updated successfully");
      } else {
        await api.rooms.create(data);
        toast.success("Room created successfully");
      }
      handleDialogChange(false);
      loadData();
    } catch (error) {
      toast.error(errorMessage(error, `Failed to ${editingId ? "update" : "create"} room`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (room: Room) => {
    setForm({
      code: room.code,
      name: room.name || "",
      building: room.building || "",
      type: room.type,
      capacity: room.capacity,
      departmentId: idOf(room.departmentId),
    });
    setEditingId(room._id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.rooms.delete(id);
      loadData();
      toast.success("Room deleted successfully");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete room"));
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setForm(emptyForm);
      setEditingId(null);
    }
  };

  const filtered = rooms.filter((r) => {
    const text = `${r.code} ${r.name ?? ""} ${r.building ?? ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (filterType === "all" || r.type === filterType);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground">Lab subjects are scheduled in labs, everything else in lecture or seminar rooms with enough seats.</p>
        </div>

        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Room</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Room" : "Add Room"}</DialogTitle>
              <DialogDescription>Rooms the generator can book for classes.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" required placeholder="LH-101" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="w-full h-9 rounded-md border px-3 text-sm"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as RoomType })}
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Lecture Hall 1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="building">Building</Label>
                  <Input id="building" placeholder="Main Block" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Seats</Label>
                  <Input id="capacity" type="number" min="1" required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    className="w-full h-9 rounded-md border px-3 text-sm"
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  >
                    <option value="">Shared</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.code}</option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update Room" : "Save Room"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Rooms", value: rooms.length, icon: DoorOpen },
          { label: "Labs", value: rooms.filter((r) => r.type === "lab").length, icon: FlaskConical },
          { label: "Total Seats", value: rooms.reduce((n, r) => n + r.capacity, 0), icon: Users },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="p-6 flex flex-row items-center justify-between">
              <div className="text-sm font-medium">{stat.label}</div>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="px-6 pb-6 text-2xl font-bold">{stat.value}</div>
          </Card>
        ))}
      </div>

      <Card className="border shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row gap-4 border-b">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search rooms..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="all">All Types</option>
              {ROOM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="h-12 px-4 align-middle">Code</th>
                <th className="h-12 px-4 align-middle">Name</th>
                <th className="h-12 px-4 align-middle">Type</th>
                <th className="h-12 px-4 align-middle">Seats</th>
                <th className="h-12 px-4 align-middle">Department</th>
                <th className="h-12 px-4 align-middle text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="h-32 text-center text-muted-foreground">No rooms found. Without rooms, timetables are generated without room assignments.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-mono font-medium">{r.code}</td>
                    <td className="p-4">
                      <div>{r.name || "-"}</div>
                      {r.building && <div className="text-xs text-muted-foreground">{r.building}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        r.type === "lab" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                        r.type === "seminar" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
                        {ROOM_TYPES.find((t) => t.value === r.type)?.label}
                      </span>
                    </td>
                    <td className="p-4">{r.capacity}</td>
                    <td className="p-4 text-muted-foreground">{docOf(r.departmentId)?.code ?? "Shared"}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(r)} className="text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(r._id)} className="text-muted-foreground hover:text-destructive">
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
