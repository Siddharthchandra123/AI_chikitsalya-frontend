"use client"

import { motion } from "framer-motion"
import { Plus, Heart, Sparkles, Activity, Clock, FileText, CheckCircle2 } from "lucide-react"
import { DischargeReadiness } from "@/components/dashboard/discharge-readiness"
import { DischargeKit } from "@/components/dashboard/discharge-kit"
import { AnalyticsCards } from "@/components/dashboard/analytics-cards"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function DashboardPage() {
  return (
    <main className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, <span className="text-primary">Rahul</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Your discharge process is <span className="text-primary font-bold">80% complete</span>. Final steps pending.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="rounded-2xl border-slate-200 dark:border-slate-800">
            View Protocol
          </Button>
          <Button size="lg" className="rounded-2xl shadow-xl shadow-primary/20" onClick={() => toast.info("Opening Upload Portal...")}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Records
          </Button>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Stats & Readiness */}
        <div className="lg:col-span-8 space-y-8">
          <AnalyticsCards />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DischargeReadiness />
            <div className="space-y-6">
              <Card className="border-none shadow-xl bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-sm border border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Bill Updated", time: "2h ago", type: "billing", icon: FileText },
                    { title: "Doctor Signed", time: "5h ago", type: "clinical", icon: CheckCircle2 },
                    { title: "Report Uploaded", time: "Yesterday", type: "report", icon: Clock },
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-indigo-700 text-primary-foreground overflow-hidden relative group">
                <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Heart className="w-40 h-40" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Next Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold tracking-tighter">14 May 2026</p>
                  <p className="text-sm opacity-90 mt-1 font-medium">Dr. Amit Verma • 10:30 AM</p>
                  <Button variant="secondary" size="sm" className="mt-6 w-full rounded-xl font-bold bg-white text-primary hover:bg-white/90">
                    Add to Calendar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Column - Kit & AI */}
        <div className="lg:col-span-4 space-y-8">
          <DischargeKit />
          
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-400 to-accent" />
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Health Coach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 italic text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                "Hi Rahul! You're doing great. Remember to complete your morning dose of Amoxicillin. Your recovery metrics are looking better than 85% of similar cases."
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl text-xs h-10 font-bold">Log Symptoms</Button>
                <Button className="flex-1 rounded-xl text-xs h-10 font-bold shadow-lg shadow-primary/10">Ask AI</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

