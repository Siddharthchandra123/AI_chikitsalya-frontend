"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Pill, CalendarClock, Video, MapPin, Bell, Calendar as CalendarIcon, 
  CheckCircle2, Plus, PhoneCall, AlertCircle, Info, Search, Layers, ChevronRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Mock Data
const activePrescriptions = [
  {
    id: "MED-001",
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times a day",
    duration: "7 Days",
    started: "May 01, 2026",
    ends: "May 08, 2026",
    instructions: "Take with food",
    status: "Active",
  },
  {
    id: "MED-002",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "Ongoing",
    started: "Jan 15, 2026",
    ends: "Continuous",
    instructions: "Take in the morning",
    status: "Active",
  },
  {
    id: "MED-003",
    name: "Metformin",
    dosage: "850mg",
    frequency: "Twice daily",
    duration: "Ongoing",
    started: "Feb 10, 2026",
    ends: "Continuous",
    instructions: "Take with meals",
    status: "Active",
  },
]

const pastPrescriptions = [
  {
    id: "MED-004",
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "As needed",
    duration: "3 Days",
    started: "April 15, 2026",
    ends: "April 18, 2026",
    instructions: "For pain relief",
    status: "Completed",
  },
]

const appointments = [
  {
    id: "APP-001",
    doctor: "Dr. Amit Verma",
    specialty: "Pulmonology",
    date: "May 14, 2026",
    time: "10:30 AM",
    type: "In-Person",
    location: "Clinic A, Floor 2",
    status: "Confirmed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dr-amit",
  },
  {
    id: "APP-002",
    doctor: "Dr. Sarah Johnson",
    specialty: "General Physician",
    date: "May 21, 2026",
    time: "03:00 PM",
    type: "Tele-consult",
    location: "Virtual Link",
    status: "Upcoming",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dr-sarah",
  },
]

function CarePlanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sectionParam = searchParams.get("section") || "all"

  const [activeTab, setActiveTab] = useState<string>(sectionParam)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (sectionParam) {
      setActiveTab(sectionParam)
    }
  }, [sectionParam])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    if (tabId === "all") {
      router.push("/insurance/care-plan")
    } else {
      router.push(`/insurance/care-plan?section=${tabId}`)
      const el = document.getElementById(tabId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const handleRefillAll = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Sending refill request for active medications...',
        success: 'Refill request sent to pharmacy for approval!',
        error: 'Failed to send refill request.',
      }
    )
  }

  const handleNewAppointment = () => {
    toast.info("Opening Scheduler", {
      description: "Fetching available slots for Dr. Amit Verma...",
    })
  }

  const handleEmergency = () => {
    toast.error("EMERGENCY PROTOCOL ACTIVATED", {
      description: "Dispatching nearest ambulance and notifying ER. Please stay on the line.",
      duration: 10000,
    })
  }

  const filteredMeds = activePrescriptions.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.instructions.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAppointments = appointments.filter(a => 
    a.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.date.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const navTabs = [
    { id: "all", label: "All Care Plans", icon: Layers, badge: "Combined" },
    { id: "prescriptions", label: "Prescriptions", icon: Pill, badge: `${activePrescriptions.length} Active` },
    { id: "follow-ups", label: "Follow-Up Visits", icon: CalendarClock, badge: `${appointments.length} Visits` },
    { id: "reminders", label: "Reminders & Alerts", icon: Bell, badge: "Notifications" },
  ]

  return (
    <main className="min-h-screen p-4 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Care Plan & Follow-Ups
          </h1>
          <p className="text-muted-foreground font-medium">
            Active medication schedules, refill management, and post-discharge consultations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="destructive" className="rounded-2xl h-11 shadow-lg shadow-destructive/20" onClick={handleEmergency}>
            <PhoneCall className="w-4 h-4 mr-2" />
            SOS Emergency
          </Button>
          <Button variant="outline" className="rounded-2xl h-11 border-slate-200 dark:border-slate-800" onClick={handleNewAppointment}>
            <Plus className="w-4 h-4 mr-2 text-primary" />
            Book Follow-Up
          </Button>
          <Button className="rounded-2xl h-11 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" onClick={handleRefillAll}>
            <Pill className="w-4 h-4 mr-2" />
            Refill All Medications
          </Button>
        </div>
      </motion.div>

      {/* Sticky Horizontal Sub-Navigation Bar */}
      <div className="sticky top-16 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl transition-all">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-1 sm:pb-0">
            {navTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider",
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}>
                    {tab.badge}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meds or doctors..."
              className="pl-9 h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* Sections Container */}
      <div className="space-y-12">
        {/* SECTION 1: PRESCRIPTIONS & MEDICATIONS */}
        {(activeTab === "all" || activeTab === "prescriptions") && (
          <section id="prescriptions" className="space-y-6 scroll-mt-36">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Prescriptions & Medications</h2>
                  <p className="text-xs text-muted-foreground font-medium">Daily dosage schedule, course progression, and pharmacy refill triggers</p>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 bg-primary/10 text-primary font-bold text-xs">
                {filteredMeds.length} Active Prescriptions
              </Badge>
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                <TabsTrigger value="active">Active Regimen ({filteredMeds.length})</TabsTrigger>
                <TabsTrigger value="history">Past Prescriptions ({pastPrescriptions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMeds.map((med, index) => (
                    <motion.div
                      key={med.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-indigo-500" />
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300">
                              <Pill className="w-6 h-6" />
                            </div>
                            <Badge variant="secondary" className="rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">
                              {med.dosage}
                            </Badge>
                          </div>
                          <div className="space-y-4 mb-6">
                            <div>
                              <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{med.name}</h3>
                              <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">{med.frequency}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-black text-slate-400 uppercase">Course</p>
                                <p className="text-[11px] font-bold text-slate-900 dark:text-white">{med.duration}</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-black text-slate-400 uppercase">Ends Date</p>
                                <p className="text-[11px] font-bold text-slate-900 dark:text-white">{med.ends}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                              <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="text-[11px] font-bold text-primary italic">{med.instructions}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              className="flex-1 rounded-xl h-10 border-slate-200 dark:border-slate-800 font-bold text-xs"
                              onClick={() => toast.info(`Medication Info: ${med.name}`)}
                            >
                              DETAILS
                            </Button>
                            <Button
                              className="flex-1 rounded-xl h-10 bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20"
                              onClick={() => toast.success(`Refill order for ${med.name} sent to pharmacy`)}
                            >
                              REORDER
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pastPrescriptions.map((med) => (
                        <div key={med.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">{med.name}</h4>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                                {med.dosage} • Ended {med.ends}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" className="rounded-xl font-bold text-xs h-9 border-slate-200 dark:border-slate-800" onClick={() => toast.success(`Reordering ${med.name}`)}>
                            REORDER
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        )}

        {/* SECTION 2: FOLLOW-UP APPOINTMENTS */}
        {(activeTab === "all" || activeTab === "follow-ups") && (
          <section id="follow-ups" className="space-y-6 scroll-mt-36">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
                  <CalendarClock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Follow-Up Appointments</h2>
                  <p className="text-xs text-muted-foreground font-medium">Post-discharge clinical review dates, doctor profiles, and tele-consultation links</p>
                </div>
              </div>
              <Button size="sm" className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold" onClick={handleNewAppointment}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Schedule Visit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAppointments.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-none shadow-xl bg-white dark:bg-slate-900 group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative">
                    <div className={cn(
                      "absolute top-0 left-0 w-full h-1.5",
                      app.type === "In-Person" ? "bg-indigo-500" : "bg-teal-500"
                    )} />
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-md">
                            <AvatarImage src={app.avatar} />
                            <AvatarFallback className="font-bold">{app.doctor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{app.doctor}</h4>
                            <p className="text-xs font-bold text-primary uppercase tracking-wider">{app.specialty}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-xs uppercase px-3 py-1">
                          {app.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Date</p>
                            <p className="font-bold">{app.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarClock className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Time</p>
                            <p className="font-bold">{app.time}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider",
                          app.type === "In-Person" ? "bg-indigo-500/10 text-indigo-600" : "bg-teal-500/10 text-teal-600"
                        )}>
                          {app.type === "In-Person" ? <MapPin className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                          {app.type} ({app.location})
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold" onClick={() => toast.info(`Rescheduling ${app.doctor}`)}>
                            Reschedule
                          </Button>
                          <Button size="sm" className="rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20" onClick={() => toast.success(app.type === "In-Person" ? "Opening Maps Directions" : "Joining Teleconsultation Room")}>
                            {app.type === "In-Person" ? "Directions" : "Join Call"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: REMINDERS & EMERGENCY PROTOCOL */}
        {(activeTab === "all" || activeTab === "reminders") && (
          <section id="reminders" className="space-y-6 scroll-mt-36">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Health Reminders & Emergency Support</h2>
                  <p className="text-xs text-muted-foreground font-medium">Critical recovery milestones, medication adherence alerts, and 24/7 SOS hotline</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-xl bg-gradient-to-br from-indigo-600 to-primary text-white rounded-3xl overflow-hidden p-8 space-y-6 relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Bell className="w-40 h-40" />
                </div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-2xl font-black">Active Health Reminders</h3>
                  <p className="text-xs text-white/70">Personalized recovery schedule maintained by AI Health Assistant</p>
                </div>
                <div className="space-y-3 relative z-10">
                  {[
                    { title: "Complete Amoxicillin Course", desc: "2 days remaining (Ends May 08). Finish full antibiotic dose to prevent recurrence.", icon: CheckCircle2 },
                    { title: "Upcoming Follow-up with Dr. Amit Verma", desc: "Scheduled for 14 May 2026 at 10:30 AM at Clinic A.", icon: CalendarClock },
                  ].map((note, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                        <note.icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black uppercase tracking-tight">{note.title}</p>
                        <p className="text-[11px] font-medium text-white/80 leading-relaxed">{note.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-6 space-y-6 relative border-l-4 border-l-destructive">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" /> Emergency Protocol
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If you experience chest pain, severe shortness of breath, or fever over 103°F, trigger instant emergency response.
                  </p>
                </div>
                <Button variant="destructive" className="w-full h-14 rounded-2xl font-black text-sm shadow-xl shadow-destructive/30 uppercase tracking-wider" onClick={handleEmergency}>
                  <PhoneCall className="w-4 h-4 mr-2" /> ACTIVATE SOS HOTLINE
                </Button>
              </Card>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default function UnifiedCarePlanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-muted-foreground">Loading Care Plan...</div>}>
      <CarePlanContent />
    </Suspense>
  )
}
