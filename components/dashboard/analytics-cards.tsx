"use client"

import { motion } from "framer-motion"
import { TrendingUp, Activity, Heart, Thermometer } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const stats = [
  {
    label: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    icon: Activity,
    trend: "normal",
    change: "Stable",
  },
  {
    label: "Heart Rate",
    value: "72",
    unit: "bpm",
    icon: Heart,
    trend: "normal",
    change: "+2%",
  },
  {
    label: "Temperature",
    value: "98.6",
    unit: "°F",
    icon: Thermometer,
    trend: "normal",
    change: "Normal",
  },
  {
    label: "Recovery",
    value: "85",
    unit: "%",
    icon: TrendingUp,
    trend: "up",
    change: "+15%",
  },
]

const trendColors = {
  up: "text-success",
  down: "text-destructive",
  normal: "text-primary",
}

export function AnalyticsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
        >
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "p-3 rounded-2xl transition-colors",
                    stat.trend === "up" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                  )}
                >
                  <stat.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  stat.trend === "up" ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"
                )}>
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {stat.value}
                  <span className="text-xs font-medium text-slate-400 ml-1 tracking-normal">
                    {stat.unit}
                  </span>
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

