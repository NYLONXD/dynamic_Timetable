"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { docOf, errorMessage, idOf, periodTime } from "@/lib/utils";
import { Generation, Room, Section, Teacher, TimetableSlot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Clock, AlertTriangle, CheckCircle2, Users, ArrowLeft, DoorOpen, Layers, CalendarRange } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type View = "section" | "teacher" | "room";

const VIEWS: { value: View; label: string; icon: typeof Users }[] = [
  { value: "section", label: "Sections", icon: Layers },
  { value: "teacher", label: "Teachers", icon: Users },
  { value: "room", label: "Rooms", icon: DoorOpen },
];

// Unique records, sorted by label
function uniqueBy<T extends { _id: string }>(items: (T | undefined)[], label: (item: T) => string) {
  const byId = new Map<string, T>();
  for (const item of items) if (item) byId.set(item._id, item);
  return [...byId.values()]
    .map((item) => ({ id: item._id, label: label(item) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

const sectionCodes = (slot: TimetableSlot, except?: string) =>
  slot.sectionIds.filter((s) => idOf(s) !== except).map((s) => docOf(s)?.code ?? "?").join(" + ");

export default function TimetableViewPage() {
  const params = useParams();
  const router = useRouter();
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [view, setView] = useState<View>("section");
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);

  const slots = useMemo(() => generation?.slots ?? [], [generation]);

  // What the timetable can be viewed by: every section, teacher and room it uses
  const options = useMemo(
    () => ({
      section: uniqueBy(slots.flatMap((s) => s.sectionIds.map((x) => docOf<Section>(x))), (s) => `${s.code}${s.name ? ` - ${s.name}` : ""}`),
      teacher: uniqueBy(slots.map((s) => docOf<Teacher>(s.teacherId)), (t) => t.name),
      room: uniqueBy(slots.map((s) => docOf<Room>(s.roomId)), (r) => `${r.code} (${r.capacity} seats)`),
    }),
    [slots]
  );

  const loadTimetable = useCallback(async () => {
    try {
      const data: Generation = await api.timetable.getOne(params.id as string);
      setGeneration(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  // Keep a valid selection for the current view
  useEffect(() => {
    if (!options[view].some((o) => o.id === selected)) {
      setSelected(options[view][0]?.id ?? "");
    }
  }, [options, view, selected]);

  const handleActivate = async () => {
    try {
      await api.timetable.activate(params.id as string);
      loadTimetable();
      toast.success("Timetable activated successfully");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to activate timetable"), { duration: 10000 });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold mb-2">Timetable not found</h3>
        <Button onClick={() => router.push("/dashboard/timetable")}>
          Back to Timetables
        </Button>
      </div>
    );
  }

  const { config } = generation;
  const breaks = new Set(config.breakPeriods ?? []);
  const termName = docOf(generation.termId as { _id: string; name: string } | string | undefined)?.name;

  const shown = slots.filter((s) =>
    view === "section" ? s.sectionIds.some((x) => idOf(x) === selected) :
    view === "teacher" ? idOf(s.teacherId) === selected :
    idOf(s.roomId) === selected
  );

  // One class in a cell: what it is, plus the two other things the current view doesn't show
  const renderEntry = (slot: TimetableSlot) => {
    const subject = docOf(slot.subjectId);
    const teacher = docOf(slot.teacherId)?.name;
    const room = docOf(slot.roomId)?.code;
    const others = view === "section" ? sectionCodes(slot, selected) : "";
    const lines =
      view === "section" ? [teacher, room, others && `with ${others}`] :
      view === "teacher" ? [sectionCodes(slot) + (slot.batch ? ` ${slot.batch}` : ""), room] :
      [sectionCodes(slot) + (slot.batch ? ` ${slot.batch}` : ""), teacher];
    return (
      <div key={slot._id} className="bg-primary/10 hover:bg-primary/20 transition-colors p-2 rounded-lg border border-primary/20 text-left">
        <div className="flex items-center gap-1 font-semibold text-sm">
          {subject?.code ?? "?"}
          {view === "section" && slot.batch && (
            <span className="rounded bg-background px-1 text-[10px] font-mono">{slot.batch}</span>
          )}
        </div>
        {lines.filter(Boolean).map((line, i) => (
          <div key={i} className="text-xs text-muted-foreground truncate">{line}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/timetable">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{generation.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              {termName && (
                <span className="flex items-center gap-1">
                  <CalendarRange className="h-4 w-4" />
                  {termName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(generation.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {generation.generationTime?.toFixed(2)}s
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            generation.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
            generation.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
          }`}>
            {generation.status.toUpperCase()}
          </div>
          {generation.status !== 'active' && (
            <Button onClick={handleActivate}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Activate
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Scheduled Periods", value: slots.length },
          { label: "Conflicts", value: generation.conflicts?.length ?? 0, className: "text-red-600 dark:text-red-400" },
          { label: "Sections", value: options.section.length },
          { label: "Rooms Used", value: options.room.length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.className ?? ""}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {generation.conflicts && generation.conflicts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Conflicts Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {generation.conflicts.map((c) => (
              <div key={c._id} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                <span className={`font-medium uppercase text-xs mt-0.5 px-1.5 py-0.5 rounded ${
                  c.severity === "error" ? "bg-red-200 dark:bg-red-800" : "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200"
                }`}>
                  {c.severity}
                </span>
                <span className="flex-1">{c.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex rounded-lg bg-muted p-1">
              {VIEWS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setView(value)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    view === value ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
            <select
              className="h-9 rounded-md border bg-transparent px-3 text-sm shadow-sm"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {options[view].length === 0 && <option value="">None in this timetable</option>}
              {options[view].map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium bg-muted/50">Period</th>
                  {config.days.map((day) => (
                    <th key={day} className="text-center p-3 font-medium bg-muted/50">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: config.periodsPerDay }, (_, i) => i + 1).map((period) => {
                  const time = periodTime(config.periodTimes, period);
                  const breakName = period === config.lunchPeriod ? "Lunch" : breaks.has(period) ? "Break" : "";
                  return (
                    <tr key={period} className="border-b">
                      <td className="p-3 bg-muted/30 whitespace-nowrap">
                        <div className="font-semibold">Period {period}</div>
                        {time && <div className="text-xs text-muted-foreground">{time}</div>}
                      </td>
                      {breakName ? (
                        <td colSpan={config.days.length} className="p-2 text-center text-sm text-muted-foreground bg-muted/20 tracking-widest uppercase">
                          {breakName}
                        </td>
                      ) : (
                        config.days.map((day) => {
                          const here = shown.filter((s) => s.day === day && s.period === period);
                          return (
                            <td key={day} className="p-2 text-center align-top">
                              {here.length > 0 ? (
                                <div className="space-y-1">{here.map(renderEntry)}</div>
                              ) : (
                                <div className="text-muted-foreground text-sm">—</div>
                              )}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
