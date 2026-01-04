// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <Calendar size={18} />
          </div>
          <span>DynamicTime</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/sign-in" className="text-sm font-medium hover:text-primary transition-colors">
            Log in
          </Link>
          <Link href="/get-started">
            <Button size="sm" className="rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Now v1.0 Available
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Master Your Schedule, <br />
              <span className="text-primary">Minimize the Chaos.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The intelligent timetable solution for modern colleges. Auto-generate conflict-free schedules, manage faculty loads, and streamline academic operations in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/get-started">
                <Button size="lg" className="rounded-full h-12 px-8 text-base">
                  Start Generating <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="rounded-full h-12 px-8 text-base">
                  See how it works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 bg-secondary/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Clock,
                  title: "Instant Generation",
                  desc: "Create conflict-free timetables in seconds using our advanced genetic algorithms."
                },
                {
                  icon: CheckCircle2,
                  title: "Conflict Detection",
                  desc: "Automatically flag overlapping classes, room double-bookings, and teacher unavailability."
                },
                {
                  icon: Calendar,
                  title: "Dynamic Adjustments",
                  desc: "Drag-and-drop to reschedule instantly. Changes propagate to all students and staff immediately."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-background border rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}