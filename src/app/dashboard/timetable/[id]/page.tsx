"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Generation, TimetableSlot, Section } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Calendar, Clock, AlertTriangle, CheckCircle2, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function TimetableViewPage() {
  const params = useParams();
  const router = useRouter();
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, [params.id]);

  const loadTimetable = async () => {
    try {
      const data = await api.timetable.getOne(params.id as string);
      setGeneration(data);
      
      const sectionObjects = data.slots
        ?.filter((s: TimetableSlot) => typeof s.sectionId === "object")
        .map((s: TimetableSlot) => s.sectionId as Section)
        .filter((s: Section, i: number, arr: Section[]) => 
          arr.findIndex(x => x._id === s._id) === i
        ) || [];
      
      setSections(sectionObjects);
      if (sectionObjects.length > 0) {
        setSelectedSection(sectionObjects[0]._id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      await api.timetable.activate(params.id as string);
      loadTimetable();
      toast.success("Timetable activated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to activate timetable");
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

  const sectionSlots = generation.slots?.filter(
    (s) => (typeof s.sectionId === "object" ? s.sectionId._id : s.sectionId) === selectedSection
  ) || [];

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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generation.slots?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {generation.conflicts?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Working Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generation.config.days.length}</div>
          </CardContent>
        </Card>
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
            {generation.conflicts.map((c, i) => (
              <div key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                <span className="font-medium uppercase text-xs mt-0.5 px-1.5 py-0.5 bg-red-200 dark:bg-red-800 rounded">
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Section View
            </CardTitle>
            <select
              className="h-9 rounded-md border bg-transparent px-3 text-sm shadow-sm"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name || s.branch}
                </option>
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
                  {generation.config.days.map((day) => (
                    <th key={day} className="text-center p-3 font-medium bg-muted/50">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: generation.config.periodsPerDay }, (_, i) => i + 1).map((period) => (
                  <tr key={period} className="border-b">
                    <td className="p-3 font-semibold bg-muted/30">Period {period}</td>
                    {generation.config.days.map((day) => {
                      const slot = sectionSlots.find((s) => s.day === day && s.period === period);
                      
                      return (
                        <td key={day} className="p-2 text-center">
                          {slot ? (
                            <div className="bg-primary/10 hover:bg-primary/20 transition-colors p-3 rounded-lg border border-primary/20">
                              <div className="font-semibold text-sm">
                                {typeof slot.subjectId === "object" ? slot.subjectId.code : "?"}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {typeof slot.teacherId === "object" ? slot.teacherId.name : "?"}
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted-foreground text-sm">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}