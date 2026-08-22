"use client"

import { motion } from "framer-motion"
import {
  FileText,
  Scan,
  Activity,
  Image,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const reports = [
  {
    name: "CBC Report",
    icon: FileText,
    status: "normal",
    date: "Apr 28, 2024",
  },
  {
    name: "MRI Scan",
    icon: Scan,
    status: "observation",
    date: "Apr 29, 2024",
  },
  {
    name: "ECG",
    icon: Activity,
    status: "normal",
    date: "Apr 29, 2024",
  },
  {
    name: "X-Ray",
    icon: Image,
    status: "critical",
    date: "Apr 30, 2024",
  },
]

const statusConfig = {
  normal: {
    label: "Normal",
    icon: CheckCircle,
    className: "bg-success/20 text-success border-success/30",
  },
  observation: {
    label: "Observation",
    icon: AlertTriangle,
    className: "bg-warning/20 text-warning border-warning/30",
  },
  critical: {
    label: "Critical",
    icon: AlertCircle,
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
}

export function ReportsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="h-full border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Medical Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reports.map((report, index) => {
              const status = statusConfig[report.status as keyof typeof statusConfig]
              const StatusIcon = status.icon

              return (
                <motion.div
                  key={report.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <report.icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="outline" className={cn("text-xs", status.className)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-foreground mb-1">
                    {report.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {report.date}
                  </p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="h-8 px-2">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 px-2">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

