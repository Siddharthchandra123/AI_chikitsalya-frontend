"use client"

import { motion } from "framer-motion"
import {
  Pill,
  FileText,
  Download,
  Share2,
  Sparkles,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const prescriptions = [
  {
    name: "Metformin 500mg",
    dosage: "1 tablet",
    timing: "After breakfast",
    duration: "30 days",
  },
  {
    name: "Amlodipine 5mg",
    dosage: "1 tablet",
    timing: "Before bed",
    duration: "30 days",
  },
  {
    name: "Aspirin 75mg",
    dosage: "1 tablet",
    timing: "After lunch",
    duration: "30 days",
  },
  {
    name: "Pantoprazole 40mg",
    dosage: "1 tablet",
    timing: "Before breakfast",
    duration: "14 days",
  },
]

export function PrescriptionsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="h-full border-0 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Prescriptions
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Dr. Priya Mehta
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Medicine List */}
          <div className="space-y-3">
            {prescriptions.map((med, index) => (
              <motion.div
                key={med.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{med.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {med.dosage} • {med.timing}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {med.duration}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              View PDF
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* AI Button */}
          <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Explain Prescription
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

