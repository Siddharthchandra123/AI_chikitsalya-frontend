"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  FileText,
  Pill,
  Shield,
  User,
  Activity,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NavbarProps {
  onMenuClick: () => void;
}

const SEARCH_PRESETS = [
  { title: "Discharge Summary & Protocol", category: "Documents", href: "/insurance/documents", icon: FileText },
  { title: "Cashless Pre-Auth Claim (CLM-2026-9842)", category: "Insurance", href: "/insurance/insurance", icon: Shield },
  { title: "Amoxicillin 500mg Prescription", category: "Prescriptions", href: "/insurance/care-plan?section=prescriptions", icon: Pill },
  { title: "Dr. Amit Verma (Cardiology)", category: "Doctors", href: "/doctors", icon: User },
  { title: "Final Hospital Bill & Receipts", category: "Billing", href: "/insurance/documents", icon: Activity },
];

export function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredResults = SEARCH_PRESETS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectResult = (href: string, title: string) => {
    setIsSearchFocused(false);
    setSearchQuery("");
    toast.info(`Opening ${title}...`);
    router.push(href);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 shadow-sm"
    >
      {/* Left side: Mobile Menu Button & Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden rounded-xl"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Global Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search medical records, insurance claims, prescriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="pl-10 pr-12 h-10 bg-slate-100/70 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs focus-visible:ring-2 focus-visible:ring-primary/40 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md font-mono border border-slate-300/50 dark:border-slate-700">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Search Predictive Dropdown Overlay */}
          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-12 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-3 z-50 space-y-2 overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Search Suggestions</span>
                  <span className="text-primary font-mono">{filteredResults.length} results</span>
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {filteredResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      No matching records found for &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    filteredResults.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectResult(item.href, item.title)}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                              <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right side: Health Status, Theme, Notifications & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Discharge Active (80%)</span>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl relative border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-slate-900" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-3 rounded-3xl shadow-2xl">
            <DropdownMenuLabel className="flex justify-between items-center text-xs font-bold">
              <span>Notifications</span>
              <Badge className="bg-primary/10 text-primary text-[10px] font-bold">2 New</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            <div className="space-y-2">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Pre-Auth Approved ₹1,20,000</p>
                <p className="text-[10px] text-slate-400">Star Health TPA issued cashless letter.</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Dr. Verma Signed Summary</p>
                <p className="text-[10px] text-slate-400">Discharge protocol ready for review.</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2.5 pl-1 cursor-pointer group">
              <Avatar className="h-9 w-9 border-2 border-primary/20 group-hover:border-primary transition-colors p-0.5">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" />
                <AvatarFallback className="font-bold text-xs bg-primary text-white">RS</AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-extrabold leading-none text-slate-900 dark:text-white">Rahul Sharma</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5 font-bold">PT-44221</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl">
            <DropdownMenuLabel className="text-xs font-bold">Rahul Sharma (Patient)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/insurance/insurance")} className="text-xs font-semibold cursor-pointer">
              Insurance Policy & Claims
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/insurance/documents")} className="text-xs font-semibold cursor-pointer">
              Medical Documents
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/insurance/settings")} className="text-xs font-semibold cursor-pointer">
              Settings & Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toast.success("Signed out successfully")}
              className="text-xs font-semibold text-rose-500 cursor-pointer"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
