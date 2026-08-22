"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Plus,
  FileText,
  Download,
  Search,
  Building2,
  Sparkles,
  PhoneCall,
  ChevronRight,
  Zap,
  RefreshCw,
  ExternalLink,
  CreditCard,
  PieChart,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const POLICY_DATA = {
  provider: "Star Health & Allied Insurance",
  policyNumber: "POL-STAR-77889900",
  policyHolder: "Rahul Sharma",
  planName: "Comprehensive Family Optima",
  sumInsured: 500000,
  claimedAmount: 120000,
  availableBalance: 380000,
  expiryDate: "31 Dec 2026",
  status: "Active & Verified",
  tpaName: "Health India TPA Services",
  tpaRefId: "TPA-HI-998231",
  roomCategory: "Single Private AC (No Capping)",
  copay: "0% (Full Cashless)",
};

const ACTIVE_CLAIM = {
  id: "CLM-2026-9842",
  hospital: "Fortis Escorts Hospital",
  admissionDate: "May 06, 2026",
  estimatedBill: "₹1,20,000",
  approvedPreAuth: "₹1,20,000",
  status: "Pre-Auth Approved",
  progress: 75,
  steps: [
    { name: "Claim Intimation", date: "06 May, 09:30 AM", status: "completed", note: "Intimation ID: INT-98412" },
    { name: "Document Audit", date: "06 May, 11:45 AM", status: "completed", note: "Verified by TPA Desk" },
    { name: "Pre-Auth Approval", date: "06 May, 02:15 PM", status: "completed", note: "Letter issued for ₹1,20,000" },
    { name: "Final Settlement", date: "Pending Discharge", status: "in-progress", note: "Awaiting final discharge summary" },
  ],
};

const CLAIM_HISTORY = [
  {
    id: "CLM-2025-4102",
    date: "14 Nov 2025",
    hospital: "Apollo Hospital, Delhi",
    type: "Cashless",
    claimed: "₹45,000",
    settled: "₹45,000",
    status: "Settled",
  },
  {
    id: "CLM-2025-1089",
    date: "22 Jun 2025",
    hospital: "Max Super Speciality",
    type: "Reimbursement",
    claimed: "₹18,500",
    settled: "₹17,200",
    status: "Settled",
  },
];

const NETWORK_HOSPITALS = [
  { name: "Fortis Escorts Hospital", city: "New Delhi", distance: "2.4 km", status: "Cashless Active" },
  { name: "Max Healthcare Super Speciality", city: "Saket", distance: "4.1 km", status: "Cashless Active" },
  { name: "Apollo Hospitals", city: "Sarita Vihar", distance: "5.8 km", status: "Cashless Active" },
];

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState<"tracker" | "policy" | "history" | "hospitals">("tracker");
  const [searchHospital, setSearchHospital] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Insurance & Claim status updated from TPA live servers!");
    }, 1000);
  };

  const handleDownloadECard = () => {
    toast.success("Downloading Digital Health Insurance E-Card...", {
      description: "PDF card saved to downloads.",
    });
  };

  const handleDownloadApprovalLetter = () => {
    toast.success("Downloading Cashless Approval Letter (Pre-Auth)...", {
      description: "Letter ID: PA-STAR-2026-9842.pdf",
    });
  };

  const handleNewClaim = () => {
    toast.info("Opening Intimation Portal", {
      description: "Active cashless claim is already in progress for current admission.",
    });
  };

  return (
    <main className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Health Insurance & TPA Portal</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Insurance & Cashless Claims
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Policy coverage, live cashless pre-authorization, and instant TPA settlement tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="rounded-2xl h-11 border-slate-200 dark:border-slate-800 font-semibold"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2 text-primary", isRefreshing && "animate-spin")} />
            Sync Status
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadECard}
            className="rounded-2xl h-11 border-slate-200 dark:border-slate-800 font-semibold"
          >
            <Download className="w-4 h-4 mr-2 text-indigo-500" />
            Download E-Card
          </Button>

          <Button
            size="sm"
            onClick={handleNewClaim}
            className="rounded-2xl h-11 font-bold shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Claim Intimation
          </Button>
        </div>
      </motion.div>

      {/* Coverage Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Sum Insured */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Total Sum Insured
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-bold">
                  {POLICY_DATA.status}
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-black tracking-tight">₹{POLICY_DATA.sumInsured.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">{POLICY_DATA.planName}</p>
              </div>
              <div className="pt-2 border-t border-indigo-900/60 flex justify-between text-xs text-slate-300">
                <span>Policy No: <strong className="font-mono text-white">{POLICY_DATA.policyNumber}</strong></span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Approved Pre-Auth Claim */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Claim Pre-Auth
                </span>
                <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none text-[10px] uppercase font-bold">
                  Cashless Approved
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  ₹{POLICY_DATA.claimedAmount.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cashless Authorized
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                <span>Claim ID: <strong className="font-mono text-slate-800 dark:text-slate-200">{ACTIVE_CLAIM.id}</strong></span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Available Coverage Balance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Remaining Policy Balance
                </span>
                <Badge variant="outline" className="text-xs font-semibold border-slate-200 dark:border-slate-800">
                  Valid to {POLICY_DATA.expiryDate}
                </Badge>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  ₹{POLICY_DATA.availableBalance.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">76% of sum insured remaining</p>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "76%" }} />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: "tracker", name: "Active Claim Tracker", icon: Zap },
          { id: "policy", name: "Policy Details & TPA", icon: ShieldCheck },
          { id: "history", name: "Settlement History", icon: Clock },
          { id: "hospitals", name: "Cashless Network Hospitals", icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "tracker" && (
          <motion.div
            key="tracker"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left 8 Cols: Claim Progress & Step Timeline */}
            <Card className="lg:col-span-8 shadow-2xl border-none bg-white dark:bg-slate-900 rounded-3xl p-8 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono text-xs font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10">
                      {ACTIVE_CLAIM.id}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">Intimated on {ACTIVE_CLAIM.admissionDate}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {ACTIVE_CLAIM.hospital}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">Pre-Auth Cashless Limit</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{ACTIVE_CLAIM.approvedPreAuth}</span>
                </div>
              </div>

              {/* Progress Bar Header */}
              <div className="py-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Settlement Progress ({ACTIVE_CLAIM.status})
                  </span>
                  <span className="text-xs font-black text-primary">{ACTIVE_CLAIM.progress}% Complete</span>
                </div>
                <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ACTIVE_CLAIM.progress}%` }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-primary via-indigo-500 to-emerald-400 rounded-full shadow-md"
                  />
                </div>
              </div>

              {/* Vertical Step Timeline */}
              <div className="space-y-8 pt-4 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                {ACTIVE_CLAIM.steps.map((step, idx) => {
                  const isDone = step.status === "completed";
                  const isInProgress = step.status === "in-progress";

                  return (
                    <div key={idx} className="relative flex items-start gap-6 pl-12 group">
                      <div
                        className={cn(
                          "absolute left-0 w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 z-10 shadow-md",
                          isDone
                            ? "bg-emerald-500 text-white shadow-emerald-500/20 scale-105"
                            : isInProgress
                            ? "bg-primary text-white ring-4 ring-primary/20 shadow-primary/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isInProgress ? (
                          <Clock className="w-5 h-5 animate-pulse" />
                        ) : (
                          <span className="text-xs">{idx + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className={cn("text-sm font-extrabold tracking-tight", isDone || isInProgress ? "text-slate-900 dark:text-white" : "text-slate-400")}>
                            {step.name}
                          </h3>
                          <span className="text-[11px] font-bold text-slate-400 font-mono">{step.date}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{step.note}</p>

                        {idx === 2 && isDone && (
                          <div className="pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleDownloadApprovalLetter}
                              className="rounded-xl text-xs h-8 font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                            >
                              <Download className="w-3.5 h-3.5 mr-1.5" />
                              View Pre-Auth Approval Letter
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Right 4 Cols: TPA Desk & Smart AI Assistant Summary */}
            <div className="lg:col-span-4 space-y-6">
              {/* TPA Contact Card */}
              <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hospital TPA Desk</h3>
                    <p className="text-xs text-slate-400">Fortis Escorts Helpdesk</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Representative:</span>
                    <strong className="text-slate-800 dark:text-slate-200">Mr. Vikram Malhotra</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TPA Helpline:</span>
                    <strong className="font-mono text-primary">1800-425-2255</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TPA Ref ID:</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">{POLICY_DATA.tpaRefId}</strong>
                  </div>
                </div>

                <Button
                  onClick={() => toast.info("Connecting to TPA Representative...", { description: "Call initiated to +91 98100 12345" })}
                  className="w-full rounded-2xl font-bold h-11 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800"
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Call TPA Representative
                </Button>
              </Card>

              {/* AI Insurance Assistant */}
              <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">AI Policy Insights</h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-800/50 text-xs leading-relaxed text-indigo-100 space-y-2">
                  <p>
                    &quot;Your Star Health policy guarantees <strong>100% cashless coverage</strong> for surgery, ICU, and room rent without sub-limits.&quot;
                  </p>
                  <p className="text-indigo-300 font-semibold text-[11px]">
                    ✓ No out-of-pocket room copay required.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info("Opening AI Health Insurance Assistant")}
                  className="w-full rounded-xl text-xs font-bold border-indigo-700/60 text-indigo-200 hover:bg-indigo-900/60"
                >
                  <HelpCircle className="w-4 h-4 mr-1.5" />
                  Ask AI About Policy Exclusions
                </Button>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "policy" && (
          <motion.div
            key="policy"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <Card className="shadow-xl border-none bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Policy Specifications
                </h3>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-xs">ACTIVE</Badge>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Policy Holder</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{POLICY_DATA.policyHolder}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Insurer Name</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{POLICY_DATA.provider}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Policy Number</span>
                  <strong className="font-mono text-primary font-bold">{POLICY_DATA.policyNumber}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Room Rent Category</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{POLICY_DATA.roomCategory}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Co-Payment Requirement</span>
                  <strong className="text-emerald-600 font-bold">{POLICY_DATA.copay}</strong>
                </div>
              </div>
            </Card>

            <Card className="shadow-xl border-none bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                  Third Party Administrator (TPA)
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Verified Partner</p>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">{POLICY_DATA.tpaName}</h4>
                </div>
                <p className="text-xs text-slate-500">
                  TPA handles cashless pre-authorizations, hospital billing clearance, and direct claim verification.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleDownloadECard}
                className="w-full rounded-2xl font-bold h-11 border-slate-200 dark:border-slate-800"
              >
                <Download className="w-4 h-4 mr-2 text-primary" />
                Download Member Health E-Card
              </Button>
            </Card>
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Card className="shadow-xl border-none bg-white dark:bg-slate-900 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Past Claim Settlements</h3>
              <div className="space-y-3">
                {CLAIM_HISTORY.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{claim.id}</span>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">{claim.type}</Badge>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{claim.hospital}</h4>
                      <p className="text-[11px] text-slate-400">{claim.date}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-black text-slate-900 dark:text-white">{claim.settled}</p>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold">{claim.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "hospitals" && (
          <motion.div
            key="hospitals"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex gap-4">
              <Input
                placeholder="Search network hospitals by name or pincode..."
                value={searchHospital}
                onChange={(e) => setSearchHospital(e.target.value)}
                className="rounded-2xl h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {NETWORK_HOSPITALS.filter((h) => h.name.toLowerCase().includes(searchHospital.toLowerCase())).map((h, i) => (
                <Card key={i} className="shadow-lg border-none bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <Building2 className="w-8 h-8 text-primary" />
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold">{h.status}</Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{h.name}</h4>
                    <p className="text-xs text-slate-400">{h.city} • {h.distance}</p>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
