"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Heart, ShieldCheck, ArrowRight, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [patientId, setPatientId] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId) {
      toast.error("Please enter your Patient ID")
      return
    }

    setLoading(true)
    // Simulate authentication
    setTimeout(() => {
      setLoading(false)
      toast.success("Authentication successful", {
        description: "Welcome back, Rahul Sharma",
      })
      router.push("/insurance")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/20 mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Chikitsalaya</h1>
          <p className="text-muted-foreground mt-2">Discharge Command Center</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Secure Login</CardTitle>
            <CardDescription>
              Enter your Patient ID to access your records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Patient ID (e.g. PT-44221)"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="pl-10 h-12 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold group" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Access Dashboard
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">
                  Security Partners
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold">HIPAA</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold">GDPR</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold">AES-256</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          By logging in, you agree to our Terms of Service and Privacy Policy. 
          <br />Need help? <Button variant="link" className="h-auto p-0 text-xs text-primary">Contact Hospital Desk</Button>
        </p>
      </motion.div>
    </div>
  )
}

