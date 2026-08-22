"use client";

import { motion } from "framer-motion";
import {
  Plus,
  Heart,
  Sparkles,
  Activity,
  Clock,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Building2,
  CalendarDays,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { DischargeReadiness } from "@/components/dashboard/discharge-readiness";
import { DischargeKit } from "@/components/dashboard/discharge-kit";
import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function DashboardPage() {
  return (
    <main className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800"
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Smart Care & Discharge Dashboard</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, <span className="text-primary">Rahul</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Your discharge workflow is <span className="text-primary font-bold">80% complete</span>. 1 step pending approval.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="rounded-2xl border-slate-200 dark:border-slate-800 font-semibold text-xs h-11"
            onClick={() => toast.info("Opening Discharge Clinical Protocol...")}
          >
            View Clinical Protocol
          </Button>

          <Button
            size="lg"
            className="rounded-2xl h-11 shadow-xl shadow-primary/20 font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500"
            onClick={() => toast.info("Opening Record Upload Portal...")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Medical Records
          </Button>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Stats & Readiness (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <AnalyticsCards />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DischargeReadiness />

            <div className="space-y-6">
              {/* Activity Card */}
              <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl p-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-extrabold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Live Medical Activity
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-200 dark:border-slate-800">
                      Real-time
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "Cashless Bill Updated", time: "2h ago", type: "billing", icon: FileText, detail: "Pre-auth ₹1,20,000 confirmed" },
                    { title: "Dr. Verma Signed Discharge", time: "5h ago", type: "clinical", icon: CheckCircle2, detail: "Summary uploaded" },
                    { title: "Lab Report Uploaded", time: "Yesterday", type: "report", icon: Clock, detail: "CBC & Lipid panel verified" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/40 transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                          <span className="text-[10px] text-muted-foreground font-mono font-semibold">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{item.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Next Appointment Hero Card */}
              <Card className="border-none shadow-xl bg-gradient-to-br from-primary via-indigo-600 to-slate-900 text-white rounded-3xl overflow-hidden relative group p-6 space-y-4">
                <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Heart className="w-40 h-40" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" /> Next Follow-Up Visit
                  </span>
                  <Badge className="bg-white/20 text-white border-none font-bold text-[10px]">Confirmed</Badge>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight">14 May 2026</p>
                  <p className="text-xs text-indigo-100 font-semibold mt-1">
                    Dr. Amit Verma • Cardiology Clinic (10:30 AM)
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toast.success("Follow-up appointment added to Google Calendar!")}
                  className="w-full rounded-2xl font-extrabold bg-white text-primary hover:bg-white/90 h-10 shadow-lg"
                >
                  Add to Google Calendar
                </Button>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Column - Kit & AI (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          <DischargeKit />

          {/* AI Health Assistant */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl relative overflow-hidden p-6 space-y-4 border border-slate-100 dark:border-slate-800">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-400 to-emerald-400" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Discharge Assistant</h3>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px]">Active</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 italic text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
              <p>
                &quot;Hi Rahul! Your recovery indicators are looking great (top 15% recovery rate). Remember your 10:00 AM dose of Amoxicillin today.&quot;
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => toast.info("Opening Symptom Logger...")}
                className="flex-1 rounded-xl text-xs h-10 font-bold border-slate-200 dark:border-slate-800"
              >
                Log Symptoms
              </Button>
              <Button
                onClick={() => toast.info("Connecting to AI Health Companion...")}
                className="flex-1 rounded-xl text-xs h-10 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
              >
                Ask AI Assistant
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
