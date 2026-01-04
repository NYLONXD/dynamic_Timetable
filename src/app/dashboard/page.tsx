"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, Layers, Calendar, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    teachers: 0,
    subjects: 0,
    sections: 0,
    timetables: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [t, s, sec, time] = await Promise.all([
          api.teachers.getAll(),
          api.subjects.getAll(),
          api.sections.getAll(),
          api.timetable.getAll(),
        ]);
        setStats({
          teachers: t.length,
          subjects: s.length,
          sections: sec.length,
          timetables: time.length,
        });
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    { label: "Total Teachers", value: stats.teachers, icon: Users, href: "/dashboard/teachers", color: "text-blue-500" },
    { label: "Total Subjects", value: stats.subjects, icon: BookOpen, href: "/dashboard/subjects", color: "text-amber-500" },
    { label: "Active Sections", value: stats.sections, icon: Layers, href: "/dashboard/sections", color: "text-emerald-500" },
    { label: "Generated Timetables", value: stats.timetables, icon: Calendar, href: "/dashboard/timetable", color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back. Here is an overview of your institute's schedule data.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4" style={{ borderLeftColor: 'currentColor' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "-" : card.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Activity Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
             <Link href="/dashboard/timetable/generate">
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
                   <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar size={20} />
                   </div>
                   <div>
                      <h4 className="font-semibold">Generate Timetable</h4>
                      <p className="text-xs text-muted-foreground">Run the genetic algorithm</p>
                   </div>
                   <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
             </Link>
             <Link href="/dashboard/teachers">
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
                   <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Users size={20} />
                   </div>
                   <div>
                      <h4 className="font-semibold">Add Faculty</h4>
                      <p className="text-xs text-muted-foreground">Register new teachers</p>
                   </div>
                   <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
             </Link>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Algorithm configuration check.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Server Status</span>
                </div>
                <span className="text-sm text-muted-foreground">Online</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">Algorithm Version</span>
                 <span className="text-xs bg-secondary px-2 py-1 rounded">v2.1 (Genetic)</span>
              </div>
               <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-md dark:bg-blue-900/20 dark:text-blue-300">
                  <strong>Tip:</strong> Ensure all teachers have assigned subjects before generating.
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}