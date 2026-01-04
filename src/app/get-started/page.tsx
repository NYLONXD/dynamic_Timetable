// src/app/get-started/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GetStartedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <div className="w-full max-w-lg space-y-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 size-4" /> Back to Home
        </Link>
        
        <Card className="border-none shadow-xl ring-1 ring-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Setup your Institute</CardTitle>
            <CardDescription>
              Enter the details below to initialize your dynamic timetable workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institute-name">Institute Name</Label>
              <Input id="institute-name" placeholder="e.g. Springfield Institute of Technology" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Input id="year" placeholder="2024-2025" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departments">No. of Depts</Label>
                <Input id="departments" type="number" placeholder="5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input id="email" type="email" placeholder="admin@institute.edu" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Link href="/dashboard" className="w-full">
              <Button className="w-full h-10 text-base">Create Workspace</Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              By clicking create, you agree to our terms of service.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}