"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/utils";
import { PeriodTime, Term, WEEK_DAYS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, Edit, CalendarRange, Clock, Lock } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  name: "",
  startDate: "",
  endDate: "",
  days: WEEK_DAYS.slice(0, 5),
  periodsPerDay: 7,
  lunchPeriod: "4",
  breakPeriods: "",
  periodTimes: [] as PeriodTime[],
};

// Helper inputs for filling in every period's clock time at once
const emptyFill = { start: "09:00", minutes: 50, gap: 0, lunchMinutes: 45 };

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

const parsePeriods = (text: string) =>
  text.split(",").map((p) => parseInt(p.trim())).filter((p) => !isNaN(p));

export default function TermsPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState<Term | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [fill, setFill] = useState(emptyFill);

  // A term's days, periods and breaks can't change once it has timetables
  const locked = !!editing?.timetableCount;

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setLoading(true);
      setTerms(await api.terms.getAll());
    } catch (error) {
      console.error(error);
      toast.error("Failed to load terms");
    } finally {
      setLoading(false);
    }
  };

  const fillTimes = () => {
    const lunch = parseInt(form.lunchPeriod);
    let minutes = toMinutes(fill.start);
    const periodTimes = Array.from({ length: form.periodsPerDay }, (_, i) => {
      const length = i + 1 === lunch ? fill.lunchMinutes : fill.minutes;
      const time = { start: toTime(minutes), end: toTime(minutes + length) };
      minutes += length + fill.gap;
      return time;
    });
    setForm({ ...form, periodTimes });
  };

  const setTime = (index: number, key: keyof PeriodTime, value: string) => {
    const periodTimes = form.periodTimes.map((t, i) => (i === index ? { ...t, [key]: value } : t));
    setForm({ ...form, periodTimes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        name: form.name,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        days: WEEK_DAYS.filter((d) => form.days.includes(d)),
        periodsPerDay: form.periodsPerDay,
        lunchPeriod: form.lunchPeriod ? parseInt(form.lunchPeriod) : null,
        breakPeriods: parsePeriods(form.breakPeriods),
        periodTimes: form.periodTimes,
      };
      if (editing) {
        await api.terms.update(editing._id, data);
        toast.success("Term updated successfully");
      } else {
        await api.terms.create(data);
        toast.success("Term created successfully");
      }
      handleDialogChange(false);
      loadTerms();
    } catch (error) {
      toast.error(errorMessage(error, `Failed to ${editing ? "update" : "create"} term`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (term: Term) => {
    setForm({
      name: term.name,
      startDate: term.startDate?.slice(0, 10) ?? "",
      endDate: term.endDate?.slice(0, 10) ?? "",
      days: term.days,
      periodsPerDay: term.periodsPerDay,
      lunchPeriod: term.lunchPeriod ? String(term.lunchPeriod) : "",
      breakPeriods: term.breakPeriods.join(", "),
      periodTimes: term.periodTimes.map(({ start, end }) => ({ start, end })),
    });
    setEditing(term);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.terms.delete(id);
      loadTerms();
      toast.success("Term deleted successfully");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete term"));
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setForm(emptyForm);
      setFill(emptyFill);
      setEditing(null);
    }
  };

  const toggleDay = (day: string) =>
    setForm({ ...form, days: form.days.includes(day) ? form.days.filter((d) => d !== day) : [...form.days, day] });

  const breakLabel = (period: number) =>
    period === parseInt(form.lunchPeriod) ? "Lunch" : parsePeriods(form.breakPeriods).includes(period) ? "Break" : "";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Terms</h1>
          <p className="text-muted-foreground">
            Each term has one bell schedule. Every department&apos;s timetable for the term uses it, so shared teachers and rooms are never double-booked.
          </p>
        </div>

        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Term</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Term" : "Add Term"}</DialogTitle>
              <DialogDescription>The working days and periods of every timetable in this term.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required placeholder="2026-27 Odd Semester" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Starts</Label>
                  <Input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Ends</Label>
                  <Input id="endDate" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>

              {locked && (
                <p className="flex items-center gap-2 text-xs rounded-md bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 p-3">
                  <Lock className="h-4 w-4 shrink-0" />
                  This term has timetables, so its days, periods and breaks are fixed. You can still rename it and change the clock times.
                </p>
              )}

              <div className="space-y-2 pt-2 border-t">
                <Label>Working days</Label>
                <div className="flex flex-wrap gap-3">
                  {WEEK_DAYS.map((day) => (
                    <label key={day} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" disabled={locked} checked={form.days.includes(day)} onChange={() => toggleDay(day)} className="rounded border-gray-300" />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periods">Periods per day</Label>
                  <Input
                    id="periods"
                    type="number"
                    min="1"
                    max="12"
                    required
                    disabled={locked}
                    value={form.periodsPerDay}
                    onChange={(e) => setForm({ ...form, periodsPerDay: parseInt(e.target.value) || 1, periodTimes: [] })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunch">Lunch period</Label>
                  <Input id="lunch" type="number" min="1" placeholder="None" disabled={locked} value={form.lunchPeriod} onChange={(e) => setForm({ ...form, lunchPeriod: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breaks">Other breaks</Label>
                  <Input id="breaks" placeholder="e.g. 3, 6" disabled={locked} value={form.breakPeriods} onChange={(e) => setForm({ ...form, breakPeriods: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div>
                  <Label>Clock times (optional)</Label>
                  <p className="text-xs text-muted-foreground mt-1">Shown on timetables. Fill them all in at once, then adjust any period.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">First period starts</Label>
                    <Input type="time" value={fill.start} onChange={(e) => setFill({ ...fill, start: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Period (min)</Label>
                    <Input type="number" min="1" value={fill.minutes} onChange={(e) => setFill({ ...fill, minutes: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gap (min)</Label>
                    <Input type="number" min="0" value={fill.gap} onChange={(e) => setFill({ ...fill, gap: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Lunch (min)</Label>
                    <Input type="number" min="1" value={fill.lunchMinutes} onChange={(e) => setFill({ ...fill, lunchMinutes: parseInt(e.target.value) || 1 })} />
                  </div>
                  <Button type="button" variant="outline" onClick={fillTimes}>
                    <Clock className="mr-2 h-4 w-4" /> Fill times
                  </Button>
                </div>
                {form.periodTimes.length > 0 && (
                  <div className="rounded-md border divide-y">
                    {form.periodTimes.map((time, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                        <span className="w-20 font-medium">Period {i + 1}</span>
                        <Input type="time" className="w-32" value={time.start} onChange={(e) => setTime(i, "start", e.target.value)} />
                        <span className="text-muted-foreground">to</span>
                        <Input type="time" className="w-32" value={time.end} onChange={(e) => setTime(i, "end", e.target.value)} />
                        <span className="text-xs text-muted-foreground">{breakLabel(i + 1)}</span>
                      </div>
                    ))}
                    <div className="px-3 py-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, periodTimes: [] })}>
                        Remove clock times
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting || form.days.length === 0}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? "Update Term" : "Save Term"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-sm">
        <div className="overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="h-12 px-4 align-middle">Term</th>
                <th className="h-12 px-4 align-middle">Days</th>
                <th className="h-12 px-4 align-middle">Periods</th>
                <th className="h-12 px-4 align-middle">Hours</th>
                <th className="h-12 px-4 align-middle">Timetables</th>
                <th className="h-12 px-4 align-middle text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : terms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-muted-foreground">
                    <CalendarRange className="h-6 w-6 mx-auto mb-2" />
                    No terms yet. Add one to set the bell schedule before generating timetables.
                  </td>
                </tr>
              ) : (
                terms.map((t) => (
                  <tr key={t._id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{t.name}</div>
                      {t.startDate && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(t.startDate).toLocaleDateString()} – {t.endDate ? new Date(t.endDate).toLocaleDateString() : "?"}
                        </div>
                      )}
                    </td>
                    <td className="p-4">{t.days.map((d) => d.slice(0, 3)).join(", ")}</td>
                    <td className="p-4">
                      {t.periodsPerDay}
                      <span className="text-xs text-muted-foreground">
                        {t.lunchPeriod ? ` · lunch ${t.lunchPeriod}` : ""}
                        {t.breakPeriods.length ? ` · breaks ${t.breakPeriods.join(", ")}` : ""}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {t.periodTimes.length ? `${t.periodTimes[0].start}–${t.periodTimes[t.periodTimes.length - 1].end}` : "-"}
                    </td>
                    <td className="p-4">{t.timetableCount ?? 0}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t._id)} className="text-muted-foreground hover:text-destructive">
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
