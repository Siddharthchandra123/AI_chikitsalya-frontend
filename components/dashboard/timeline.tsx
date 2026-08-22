"use client"

import { motion } from "framer-motion"
import {
  BedDouble,
  TestTube,
  Scan,
  Pill,
  Receipt,
  UserCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const timelineEvents = [
  {
    icon: BedDouble,
    title: "Admission",
    timestamp: "Apr 28, 9:30 AM",
    status: "completed",
  },
  {
    icon: TestTube,
    title: "Blood Test",
    timestamp: "Apr 28, 11:00 AM",
    status: "completed",
  },
  {
    icon: Scan,
    title: "MRI Uploaded",
    timestamp: "Apr 29, 2:15 PM",
    status: "completed",
  },
  {
    icon: Pill,
    title: "Prescription Added",
    timestamp: "Apr 30, 10:00 AM",
    status: "completed",
  },
  {
    icon: Receipt,
    title: "Bill Generated",
    timestamp: "May 1, 4:30 PM",
    status: "completed",
  },
  {
    icon: UserCheck,
    title: "Doctor Approval",
    timestamp: "Pending",
    status: "pending",
  },
]

const statusColors = {
  completed: "bg-success text-success-foreground",
  pending: "bg-warning text-warning-foreground",
  error: "bg-destructive text-destructive-foreground",
}

const lineColors = {
  completed: "bg-success",
  pending: "bg-warning",
  error: "bg-destructive",
}

export function Timeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="h-full border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            Patient Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex gap-4 pb-6 last:pb-0"
              >
                {/* Icon and Line */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-md",
                      statusColors[event.status as keyof typeof statusColors]
                    )}
                  >
                    <event.icon className="w-5 h-5" />
                  </div>
                  {index < timelineEvents.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-10 w-0.5 h-full",
                        lineColors[event.status as keyof typeof lineColors]
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1.5">
                  <h4 className="font-medium text-foreground">{event.title}</h4>
                  <p
                    className={cn(
                      "text-sm",
                      event.status === "pending"
                        ? "text-warning font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {event.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

