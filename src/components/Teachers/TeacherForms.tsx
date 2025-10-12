"use client";

import { useState } from "react";
import supabase  from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TeacherForm({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", department: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("teachers").insert([form]);
    if (error) console.log(error);
    else {
      setForm({ name: "", email: "", department: "" });
      onAdded();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-2xl shadow-sm mb-6 flex flex-col gap-4"
    >
      <h2 className="text-xl font-semibold">Add New Teacher</h2>
      <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <Input name="department" placeholder="Department" value={form.department} onChange={handleChange} />
      <Button type="submit">Add Teacher</Button>
    </form>
  );
}
