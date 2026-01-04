"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Generation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, Calendar, Clock, AlertTriangle, CheckCircle2, Eye, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function TimetableListPage() {
  const router = useRouter();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    try {
      const data = await api.timetable.getAll();
      setGenerations(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load timetables");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.timetable.delete(id);
      loadGenerations();
      toast.success("Timetable deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete timetable");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.timetable.activate(id);
      loadGenerations();
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetables</h1>
          <p className="text-muted-foreground mt-1">Manage and generate academic schedules</p>
        </div>
        <Button onClick={() => router.push("/dashboard/timetable/generate")}>
          <Plus className="mr-2 h-4 w-4" /> Generate New Timetable
        </Button>
      </div>

      {generations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No timetables generated yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Click "Generate New Timetable" to create your first schedule using the genetic algorithm
            </p>
            <Button onClick={() => router.push("/dashboard/timetable/generate")}>
              <Zap className="mr-2 h-4 w-4" /> Get Started
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {generations.map((g) => (
            <Card key={g._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{g.name}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(g.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    g.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    g.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {g.status.toUpperCase()}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Days/Week</div>
                    <div className="font-semibold">{g.config.days.length} days</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Periods/Day</div>
                    <div className="font-semibold">{g.config.periodsPerDay}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Gen Time</div>
                    <div className="font-semibold">{g.generationTime?.toFixed(2)}s</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Total Slots</div>
                    <div className="font-semibold">{g.slots?.length || 0}</div>
                  </div>
                </div>

                {g.conflicts && g.conflicts.length > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md text-xs">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-red-700 dark:text-red-300">
                      {g.conflicts.length} conflict{g.conflicts.length > 1 ? 's' : ''} detected
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    onClick={() => router.push(`/dashboard/timetable/${g._id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  {g.status !== 'active' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleActivate(g._id)}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Activate
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(g._id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}