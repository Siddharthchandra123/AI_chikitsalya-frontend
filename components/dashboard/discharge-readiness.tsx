"use client"

import { motion } from "framer-motion"
import {
  FileCheck,
  CreditCard,
  Shield,
  UserCheck,
  Pill,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const checklistItems = [
  { icon: FileCheck, label: "Reports Complete", completed: true },
  { icon: CreditCard, label: "Bills Cleared", completed: true },
  { icon: Shield, label: "Insurance Approved", completed: true },
  { icon: UserCheck, label: "Doctor Approval", completed: false },
  { icon: Pill, label: "Pharmacy Clearance", completed: true },
]

export function DischargeReadiness() {
  const completedCount = checklistItems.filter((item) => item.completed).length
  const progress = (completedCount / checklistItems.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="h-full border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            Discharge Readiness
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {completedCount}/{checklistItems.length} Tasks
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Circular Progress */}
          <div className="flex justify-center relative">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-slate-100 dark:text-slate-800"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  className="text-primary"
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{
                    strokeDasharray: `${(progress / 100) * 283} 283`,
                  }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {Math.round(progress)}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ready</span>
              </div>
            </div>
            {/* Decorative Dots */}
            <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-primary/20 blur-sm animate-pulse" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-accent/20 blur-md animate-pulse delay-700" />
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            {checklistItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 border",
                  item.completed
                    ? "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800"
                    : "bg-warning/5 border-warning/10"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    item.completed
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-warning/20 text-warning"
                  )}
                >
                  {item.completed ? <CheckCircle2 className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-bold",
                    item.completed ? "text-slate-900 dark:text-slate-100" : "text-warning"
                  )}>
                    {item.label}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                    {item.completed ? "Verified" : "Pending Approval"}
                  </p>
                </div>
                {!item.completed && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                  />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

