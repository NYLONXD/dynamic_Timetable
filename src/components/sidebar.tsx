"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X, LayoutDashboard, Users, BookOpen, UserCheck, Calendar, ListChecks, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  // Check screen size to prevent animation bugs on desktop
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/sections", label: "Sections", icon: BookOpen },
    { href: "/dashboard/subjects", label: "Subjects", icon: ListChecks },
    { href: "/dashboard/teachers", label: "Teachers", icon: Users },
    { href: "/dashboard/availability", label: "Availability", icon: Clock },
    { href: "/dashboard/assignments", label: "Assignments", icon: UserCheck },
    { href: "/dashboard/timetable", label: "Timetable", icon: Calendar },
  ]

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-background border rounded-md shadow-sm"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        // If mobile: animate based on 'open' state. If desktop: always show (x: 0)
        animate={{ x: isMobile ? (open ? 0 : -280) : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border shadow-sm flex flex-col md:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-sidebar-border/50">
          <div className="flex items-center gap-2 font-bold text-xl text-sidebar-foreground">
             <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                <Calendar size={18} />
             </div>
             <span>DynamicTime</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon size={18} className={cn("transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border/50">
           <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/10">
              <h4 className="text-xs font-semibold text-primary mb-1">Pro Plan</h4>
              <p className="text-[10px] text-muted-foreground mb-3">Upgrade for AI auto-generation</p>
              <button className="text-xs w-full bg-primary text-primary-foreground py-1.5 rounded shadow-sm hover:bg-primary/90 transition cursor-pointer">Upgrade</button>
           </div>
        </div>
      </motion.aside>
    </>
  )
}