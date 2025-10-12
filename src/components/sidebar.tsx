"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X, LayoutDashboard, Users, Calendar, Settings } from "lucide-react"

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/teachers", label: "Teachers", icon: Users },
    { href: "/dashboard/classes", label: "Classes", icon: Calendar },
    { href: "/dashboard/timetable", label: "Timetable", icon: Calendar },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden absolute top-4 left-4 z-50"
      >
        {open ? <X /> : <Menu />}
      </button>

      <motion.aside
        animate={{ x: open ? 0 : -260 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="fixed md:static md:w-64 bg-primary text-primary-foreground h-full p-6 shadow-lg z-40"
      >
        <h1 className="text-xl font-semibold mb-8">📘 Timetable</h1>
        <nav className="space-y-4">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 text-sm hover:bg-primary-foreground/10 rounded-md p-2 transition"
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </motion.aside>
    </>
  )
}
