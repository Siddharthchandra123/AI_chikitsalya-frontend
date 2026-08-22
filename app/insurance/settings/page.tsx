"use client"

import { motion } from "framer-motion"
import { Settings, User, Bell, Shield, Wallet, Globe, LogOut, HelpCircle, ChevronRight, Moon, Sun } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/theme-provider"
import { toast } from "sonner"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const handleSignOut = () => {
    toast.warning("Signing Out", {
      description: "Redirecting to login page...",
    })
  }

  const handleSupport = () => {
    toast.info("Support Center", {
      description: "Opening help documentation and ticket system...",
    })
  }

  const handleLinkClick = (name: string) => {
    toast(`Opening ${name}`, {
      description: "Loading section details...",
    })
  }

  const settingSections = [
    {
      title: "Profile",
      icon: User,
      description: "Manage your personal information and contact details",
      items: [
        { name: "Personal Information", type: "link" },
        { name: "Medical History Privacy", type: "link" },
        { name: "Emergency Contacts", type: "link" },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      description: "Configure how you receive updates and reminders",
      items: [
        { name: "Appointment Reminders", type: "switch", value: true },
        { name: "Billing Updates", type: "switch", value: true },
        { name: "AI Health Alerts", type: "switch", value: false },
      ],
    },
    {
      title: "Appearance",
      icon: Moon,
      description: "Customize your dashboard theme and layout",
      items: [
        {
          name: "Dark Mode",
          type: "switch",
          value: theme === "dark",
          onChange: () => setTheme(theme === "dark" ? "light" : "dark")
        },
      ],
    },
    {
      title: "Security & Privacy",
      icon: Shield,
      description: "Manage your account security and data preferences",
      items: [
        { name: "Two-Factor Authentication", type: "switch", value: true },
        { name: "Privacy Dashboard", type: "link" },
        { name: "Export My Data", type: "link" },
      ],
    },
  ]

  return (
    <main className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your portal preferences and account security</p>
      </motion.div>

      <div className="grid gap-6">
        {settingSections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <section.icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between group cursor-pointer"
                      onClick={() => item.type === "link" && handleLinkClick(item.name)}
                    >
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.type === "switch" ? (
                        <Switch
  checked={item.value}
  onCheckedChange={(checked) => {
    if ("onChange" in item && item.onChange) {
      item.onChange()
    }

    toast.success(`${item.name} updated`, {
      description: checked ? "Enabled" : "Disabled",
    })
  }}

                        />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button variant="outline" className="flex-1 gap-2 h-12" onClick={handleSupport}>
            <HelpCircle className="w-4 h-4" />
            Support Center
          </Button>
          <Button variant="destructive" className="flex-1 gap-2 h-12" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest pt-8 pb-12">
          AI Chikitsalaya v2.4.1 • Secure & HIPAA Compliant
        </p>
      </div>
    </main>
  )
}

