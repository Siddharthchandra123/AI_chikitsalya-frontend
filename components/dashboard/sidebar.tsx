"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  FileText,
  Pill,
  Receipt,
  Shield,
  ClipboardList,
  CalendarClock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/insurance" },
  { icon: FileText, label: "Documents & Reports", href: "/insurance/documents" },
  { icon: Pill, label: "Prescriptions & Follow-ups", href: "/insurance/care-plan?section=prescriptions" },
  { icon: Shield, label: "Insurance", href: "/insurance/insurance" },
  { icon: Settings, label: "Settings", href: "/insurance/settings" },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? 80 : 280,
        margin: "1rem",
        borderRadius: "1.5rem",
      }}
      transition={{ type: "spring", damping: 20, stiffness: 150 }}
      className="fixed left-0 top-0 h-[calc(100vh-2rem)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100/50 dark:border-slate-800/50">
        <motion.div
          className="flex items-center gap-3"
          animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Heart className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="font-bold text-base tracking-tight">AI Chikitsalaya</h1>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Portal v2.0</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (pathname.startsWith("/insurance/documents") && item.href.startsWith("/insurance/documents")) || (pathname.startsWith("/insurance/care-plan") && item.href.startsWith("/insurance/care-plan"))
          return (
            <Link key={item.label} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer relative group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-primary" : "text-slate-400"
                  )}
                />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-semibold tracking-tight"
                  >
                    {item.label}
                  </motion.span>
                )}
                {!collapsed && isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer Profile Mini */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-slate-100/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">Rahul Sharma</p>
              <p className="text-[10px] text-muted-foreground truncate">PT-44221</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-slate-100/50 dark:border-slate-800/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-bold">Collapse</span>
            </div>
          )}
        </Button>
      </div>
    </motion.aside>
  )
}

