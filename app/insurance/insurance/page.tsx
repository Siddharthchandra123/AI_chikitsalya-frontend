"use client"

import { motion } from "framer-motion"
import { Shield, ShieldCheck, Clock, AlertCircle, ArrowUpRight, CheckCircle2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const insuranceDetails = {
  provider: "Star Health Insurance",
  policyNumber: "POL-77889900",
  type: "Individual Health",
  sumInsured: "₹5,00,000",
  expiry: "Dec 31, 2026",
  status: "Active",
  tpaName: "Health India TPA",
}

const currentClaim = {
  id: "CLM-2026-042",
  requestDate: "May 06, 2026",
  amount: "₹16,200",
  status: "Pre-Auth Approved",
  progress: 75,
  steps: [
    { name: "Claim Intimation", completed: true, date: "May 06, 09:30 AM" },
    { name: "Document Verification", completed: true, date: "May 06, 11:45 AM" },
    { name: "Pre-Auth Approval", completed: true, date: "May 06, 02:15 PM" },
    { name: "Final Settlement", completed: false, date: "Pending Discharge" },
  ],
}

export default function InsurancePage() {
  const handleSupport = () => {
    toast.info("Connecting to Insurance Support", {
      description: "Redirecting to your TPA representative...",
    })
  }

  const handleClaim = () => {
    toast.error("Unauthorized Action", {
      description: "A claim is already in progress for this admission.",
    })
  }

  const handleViewHash = () => {
    toast("Blockchain Record", {
      description: "Hash: 0x4f...9c2a (Verified on Ethereum)",
    })
  }

  return (
    <main className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Insurance & Claims</h1>
          <p className="text-muted-foreground font-medium">Track your coverage and claim settlement status</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-11 border-slate-200 dark:border-slate-800" onClick={() => toast.info("Support ticket created")}>
            <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
            Support
          </Button>
          <Button className="rounded-2xl h-11 shadow-lg shadow-primary/20" onClick={handleClaim}>
            <Plus className="w-4 h-4 mr-2" />
            New Claim
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy Details */}
        <Card className="lg:col-span-1 h-fit border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20 group-hover:bg-primary transition-colors" />
          <CardHeader className="pb-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Policy Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Provider</p>
              <p className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{insuranceDetails.provider}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Policy Number</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{insuranceDetails.policyNumber}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Status</p>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none uppercase font-bold text-[9px]">{insuranceDetails.status}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Sum Insured</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{insuranceDetails.sumInsured}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Valid Until</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{insuranceDetails.expiry}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-3 text-center">TPA Partner Verification</p>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{insuranceDetails.tpaName}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => toast.info("Opening TPA portal...")}>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claim Tracker */}
        <Card className="lg:col-span-2 shadow-2xl border-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield className="w-32 h-32 rotate-12" />
          </div>
          <CardHeader className="pb-8 pt-10 px-8">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Active Claim Tracker</CardTitle>
              <Badge variant="outline" className="font-mono text-[10px] border-slate-200 dark:border-slate-800 rounded-lg">{currentClaim.id}</Badge>
            </div>
            <CardDescription className="font-medium">Requested on {currentClaim.requestDate}</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10 space-y-12">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Current Status</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currentClaim.status}</p>
                </div>
                <span className="text-sm font-black text-primary">{currentClaim.progress}%</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentClaim.progress}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                />
              </div>
            </div>

            <div className="relative space-y-10 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100 dark:before:bg-slate-800">
              {currentClaim.steps.map((step, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="relative flex gap-8 items-start pl-12 group"
                >
                  <div className={cn(
                    "absolute left-0 w-8 h-8 rounded-xl flex items-center justify-center z-10 transition-all duration-300",
                    step.completed 
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 scale-90"
                  )}>
                    {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className="space-y-1">
                    <p className={cn(
                      "text-sm font-bold tracking-tight",
                      step.completed ? "text-slate-900 dark:text-white" : "text-slate-400"
                    )}>{step.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{step.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="border-none shadow-xl bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-tight">
            Wait times for Pre-Auth approvals are currently higher than usual. Our team is in contact with the TPA to expedite your final settlement.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

