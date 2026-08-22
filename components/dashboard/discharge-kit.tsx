"use client"

import { motion } from "framer-motion"
import {
  Package,
  FileText,
  Pill,
  Receipt,
  Shield,
  CalendarClock,
  Download,
  QrCode,
  FolderDown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const kitFeatures = [
  { icon: FileText, label: "All Reports" },
  { icon: Pill, label: "Prescriptions" },
  { icon: Receipt, label: "Bills" },
  { icon: Shield, label: "Insurance Docs" },
  { icon: CalendarClock, label: "Follow-up Schedule" },
]

export function DischargeKit() {
  const handleGenerate = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Compiling your Smart Discharge Kit...',
        success: 'PDF generated! Opening preview...',
        error: 'Failed to generate PDF.',
      }
    )
  }

  const handleShare = () => {
    toast.success("QR Code Generated", {
      description: "You can now present this QR to any pharmacy or clinic.",
    })
  }

  const handleDownloadZip = () => {
    toast.info("Bundling all documents", {
      description: "Your zip archive will be ready shortly.",
    })
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <Card className="border-none shadow-2xl overflow-hidden relative min-h-[300px]">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500 rounded-full blur-[100px] animate-pulse delay-700" />
        </div>
        
        {/* Glass Content */}
        <CardContent className="relative p-8 h-full flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  Premium Feature
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter leading-none">
                  Smart Discharge <br /> <span className="text-indigo-300">Unified Kit</span>
                </h3>
              </div>
              <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Features Mini-Grid */}
            <div className="grid grid-cols-2 gap-3">
              {kitFeatures.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 group hover:bg-white/10 transition-colors">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <feature.icon className="w-3 h-3 text-indigo-200" />
                  </div>
                  <span className="text-[10px] font-bold text-white/80">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Ready for export</span>
              </div>
              <span className="text-[10px] font-bold text-white/40 italic">v2.0.4 Encrypted</span>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              <Button
                size="lg"
                className="col-span-3 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black text-xs h-12 shadow-xl shadow-white/10 group"
                onClick={handleGenerate}
              >
                GENERATE MASTER PDF
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="col-span-1 bg-white/10 text-white border-white/10 hover:bg-white/20 rounded-2xl h-12 backdrop-blur-md"
                onClick={handleShare}
              >
                <QrCode className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="col-span-1 bg-white/10 text-white border-white/10 hover:bg-white/20 rounded-2xl h-12 backdrop-blur-md"
                onClick={handleDownloadZip}
              >
                <FolderDown className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

