"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  FileText, Receipt, ClipboardList, Download, Search, Eye,
  CreditCard, ExternalLink, ShieldCheck, ArrowRight, Share2,
  Sparkles, QrCode, Layers
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Mock Data
const reportsData = [
  { id: "REP-001", name: "Blood Analysis Report", date: "May 05, 2026", category: "Pathology", status: "Verified", size: "1.2 MB" },
  { id: "REP-002", name: "Chest X-Ray Digital", date: "May 04, 2026", category: "Radiology", status: "Pending", size: "4.5 MB" },
  { id: "REP-003", name: "ECG Summary", date: "May 03, 2026", category: "Cardiology", status: "Verified", size: "0.8 MB" },
  { id: "REP-004", name: "Urinalysis Results", date: "May 02, 2026", category: "Pathology", status: "Verified", size: "1.1 MB" },
  { id: "REP-005", name: "MRA Brain Scan", date: "April 28, 2026", category: "Neurology", status: "Verified", size: "15.4 MB" },
]

const currentBill = {
  id: "INV-2026-001",
  date: "May 06, 2026",
  dueDate: "May 13, 2026",
  patient: "Rahul Sharma",
  hospital: "City Medical Center",
  items: [
    { name: "Consultation Fee", amount: 1500 },
    { name: "Diagnostic Tests (Blood & X-Ray)", amount: 3500 },
    { name: "Pharmacy Charges", amount: 1200 },
    { name: "Room Charges (2 Days)", amount: 8000 },
    { name: "Nursing & Services", amount: 2000 },
  ],
  total: 16200,
  tax: 810,
  insuranceCoverage: 12000,
  netPayable: 5010,
  status: "Pending",
}

function DocumentsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sectionParam = searchParams.get("section") || "all"

  const [activeTab, setActiveTab] = useState<string>(sectionParam)
  const [searchQuery, setSearchQuery] = useState("")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (sectionParam) {
      setActiveTab(sectionParam)
    }
  }, [sectionParam])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    if (tabId === "all") {
      router.push("/insurance/documents")
    } else {
      router.push(`/insurance/documents?section=${tabId}`)
      const el = document.getElementById(tabId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const handleDownloadAll = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Bundling all clinical reports, bills, and discharge summary...',
        success: 'Full Patient Record Package (ZIP) downloaded!',
        error: 'Error bundling document package.',
      }
    )
  }

  const handlePayment = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2500)),
      {
        loading: 'Processing secure payment...',
        success: 'Payment of ₹5,010 successful! Receipt generated.',
        error: 'Payment failed.',
      }
    )
  }

  const handleGenerateAI = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      toast.success("AI Summary Updated", {
        description: "Latest clinical notes and lab findings re-analyzed.",
      })
    }, 2000)
  }

  const filteredReports = reportsData.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const navTabs = [
    { id: "all", label: "All Documents", icon: Layers, badge: "3 Modules" },
    { id: "reports", label: "Medical Reports", icon: FileText, badge: `${reportsData.length} Files` },
    { id: "bills", label: "Billing & Invoices", icon: Receipt, badge: "₹5,010 Due" },
    { id: "summary", label: "Discharge Summary", icon: ClipboardList, badge: "Verified PDF" },
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
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Patient Document Hub
          </h1>
          <p className="text-muted-foreground font-medium">
            Centralized portal for diagnostic reports, billing statements, and certified discharge records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-2xl h-11 border-slate-200 dark:border-slate-800" onClick={() => toast.info("Secured Link Copied")}>
            <Share2 className="w-4 h-4 mr-2 text-primary" />
            Share Records
          </Button>
          <Button className="rounded-2xl h-11 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" onClick={handleDownloadAll}>
            <Download className="w-4 h-4 mr-2" />
            Download Full Package
          </Button>
        </div>
      </motion.div>

      {/* Sticky Horizontal Sub-Navigation Bar */}
      <div className="sticky top-16 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl transition-all">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Horizontal Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar pb-1 sm:pb-0">
            {navTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap relative shrink-0",
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

          {/* Document Search Filter */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports & invoices..."
              className="pl-9 h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        {/* SECTION 1: MEDICAL REPORTS */}
        {(activeTab === "all" || activeTab === "reports") && (
          <section id="reports" className="space-y-6 scroll-mt-36">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Medical Reports</h2>
                  <p className="text-xs text-muted-foreground font-medium">Diagnostic pathology, radiology scans, and laboratory telemetry</p>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 bg-primary/10 text-primary font-bold text-xs">
                {filteredReports.length} Available
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-none shadow-xl bg-white dark:bg-slate-900 group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300">
                          <FileText className="w-6 h-6" />
                        </div>
                        <Badge variant="secondary" className="rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">
                          {report.category}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{report.name}</h3>
                        <p className="text-xs text-muted-foreground font-medium">{report.date} • {report.id} ({report.size})</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-xl h-10 text-xs font-bold border-slate-200 dark:border-slate-800"
                          onClick={() => toast.info(`Viewing preview for ${report.name}`)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5 text-primary" />
                          VIEW
                        </Button>
                        <Button 
                          className="flex-1 rounded-xl h-10 text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                          onClick={() => toast.success(`Downloading ${report.name}`)}
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: BILLING & INVOICES */}
        {(activeTab === "all" || activeTab === "bills") && (
          <section id="bills" className="space-y-6 scroll-mt-36">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Invoices</h2>
                  <p className="text-xs text-muted-foreground font-medium">Hospital stay charges, pharmacy breakdown, and TPA insurance co-pay settlement</p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full px-3 py-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold text-xs">
                TPA 74% Approved
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500/30 group-hover:bg-indigo-500 transition-colors" />
                <CardHeader className="pb-6 pt-8 px-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Outstanding Payable</p>
                      <h3 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">₹{currentBill.netPayable.toLocaleString()}.00</h3>
                    </div>
                    <Button size="lg" className="rounded-2xl h-14 px-8 bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 font-bold" onClick={handlePayment}>
                      PAY BALANCE
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 mb-6 text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Patient</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{currentBill.patient}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Due Date</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{currentBill.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Invoice ID</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{currentBill.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                      <p className="font-bold text-amber-500">{currentBill.status}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-indigo-500" /> Itemized Charges
                    </h4>
                    <div className="grid gap-2 text-xs">
                      {currentBill.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                          <span className="font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                          <span className="font-bold text-slate-900 dark:text-white">₹{item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Payment & TPA Summary */}
              <div className="space-y-6">
                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                  <CardHeader className="pb-3 pt-6 px-6">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-500" /> Saved Payment Card
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-indigo-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-slate-900 dark:text-white">Visa •••• 4242</p>
                          <p className="text-[10px] text-slate-400">Expires 12/28</p>
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-slate-900 text-white rounded-3xl overflow-hidden p-6 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" /> TPA Coverage Approved
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Star Health Insurance has cleared ₹12,000 against IPD charges. Your final co-pay balance is ₹5,010.
                  </p>
                  <Button variant="outline" className="w-full rounded-xl border-slate-700 text-white hover:bg-slate-800 text-xs font-bold" onClick={() => toast.info("Opening TPA Pre-Auth Document...")}>
                    VIEW PRE-AUTH TPA LETTER <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: DISCHARGE SUMMARY */}
        {(activeTab === "all" || activeTab === "summary") && (
          <section id="summary" className="space-y-6 scroll-mt-36">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Discharge Summary Document</h2>
                  <p className="text-xs text-muted-foreground font-medium">Certified digital discharge record, doctor notes, lab progress, and post-discharge medication plan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-800 text-xs" onClick={handleGenerateAI} disabled={generating}>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  Regenerate AI Analysis
                </Button>
                <Button size="sm" className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold" onClick={() => toast.success("Downloading Discharge_Summary_Certified.pdf")}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download PDF
                </Button>
              </div>
            </div>

            <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden relative">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-8 py-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Discharge_Summary_v2.pdf</CardTitle>
                    <CardDescription className="text-xs font-medium">Attending Consultant: Dr. Amit Verma (MD Medicine) • 07 May 2026</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-bold text-xs uppercase px-3 py-1">
                  OFFICIAL RECORD
                </Badge>
              </CardHeader>
              <CardContent className="p-8 lg:p-12 space-y-8 font-serif text-slate-800 dark:text-slate-200">
                {generating ? (
                  <div className="py-12 space-y-6 max-w-xl mx-auto text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
                    <p className="text-xs font-sans font-medium text-primary">Regenerating smart clinical summary...</p>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header Details */}
                    <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-6 font-sans gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-primary font-serif">AI CHIKITSALAYA HOSPITAL</h3>
                        <p className="text-xs font-medium text-muted-foreground">Department of Pulmonology & Internal Medicine</p>
                      </div>
                      <div className="sm:text-right text-xs">
                        <p className="font-mono font-bold text-slate-900 dark:text-slate-100">IPD No: #AI-9902</p>
                        <p className="text-muted-foreground">Admission: 01 May 2026 | Discharge: 07 May 2026</p>
                      </div>
                    </div>

                    {/* Patient Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl font-sans text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Patient Name</p>
                        <p className="font-bold text-sm">Rahul Sharma</p>
                        <p className="text-muted-foreground">Male, 29 Yrs</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Final Diagnosis</p>
                        <p className="font-bold text-sm text-primary">Acute Bronchitis</p>
                        <p className="text-muted-foreground">Secondary Bacterial Infection</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Discharge Condition</p>
                        <p className="font-bold text-sm text-emerald-600">STABLE & RECOVERING</p>
                        <p className="text-muted-foreground">O2 Sat: 99% Room Air</p>
                      </div>
                    </div>

                    {/* Clinical Summary */}
                    <div className="space-y-2">
                      <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white border-l-4 border-primary pl-3">
                        Clinical Summary & Course in Hospital
                      </h4>
                      <p className="text-xs leading-relaxed font-sans text-slate-600 dark:text-slate-300">
                        Patient admitted with persistent cough and high-grade fever. Treated with IV Antibiotics and supportive care. Symptoms resolved significantly over 6 days with complete clearance of lung crackles and normal O2 saturation.
                      </p>
                    </div>

                    {/* Medications Table */}
                    <div className="space-y-3 font-sans">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white border-l-4 border-emerald-500 pl-3">
                        Discharge Prescription & Follow-up Plan
                      </h4>
                      <div className="border rounded-2xl overflow-hidden text-xs">
                        <Table>
                          <TableHeader className="bg-slate-50 dark:bg-slate-950">
                            <TableRow>
                              <TableHead className="font-bold text-[10px] uppercase">Medication</TableHead>
                              <TableHead className="font-bold text-[10px] uppercase">Dosage</TableHead>
                              <TableHead className="font-bold text-[10px] uppercase">Duration</TableHead>
                              <TableHead className="font-bold text-[10px] uppercase">Instructions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-bold">Tab. Amoxicillin 500mg</TableCell>
                              <TableCell>1 - 1 - 1</TableCell>
                              <TableCell>5 Days</TableCell>
                              <TableCell className="text-slate-500">After food</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-bold">Syr. Ascoril 10ml</TableCell>
                              <TableCell>1 - 0 - 1</TableCell>
                              <TableCell>3 Days</TableCell>
                              <TableCell className="text-slate-500">Warm water after intake</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Digital Seal */}
                    <div className="pt-6 border-t flex items-center justify-between font-sans">
                      <div className="flex items-center gap-3">
                        <QrCode className="w-12 h-12 text-slate-700 dark:text-slate-300" />
                        <div className="text-[10px] text-muted-foreground">
                          <p className="font-bold text-slate-900 dark:text-slate-100">Scan to Verify Digital Signature</p>
                          <p>Hash: 0x4f9c2a88e911c7</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold">DR. AMIT VERMA</p>
                        <p className="text-[10px] text-muted-foreground">Senior Consultant Pulmonologist</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </main>
  )
}

export default function UnifiedDocumentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-muted-foreground">Loading Documents Hub...</div>}>
      <DocumentsContent />
    </Suspense>
  )
}
