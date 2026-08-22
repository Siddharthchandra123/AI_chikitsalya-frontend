"use client"

import { motion } from "framer-motion"
import { User, Calendar, Stethoscope, BedDouble, Hash } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const patientData = {
  name: "Rahul Sharma",
  age: 45,
  patientId: "PAT-2024-0892",
  admissionDate: "April 28, 2024",
  doctor: "Dr. Priya Mehta",
  room: "ICU-204",
  status: "Stable",
}

export function PatientCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="w-20 h-20 border-4 border-primary/20 shadow-xl">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=rahul" />
                <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                  RS
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 className="text-2xl font-bold text-foreground">
                  {patientData.name}
                </h2>
                <Badge
                  variant="secondary"
                  className="w-fit bg-success/20 text-success border-success/30"
                >
                  <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
                  {patientData.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <InfoItem
                  icon={User}
                  label="Age"
                  value={`${patientData.age} years`}
                />
                <InfoItem
                  icon={Hash}
                  label="Patient ID"
                  value={patientData.patientId}
                />
                <InfoItem
                  icon={Calendar}
                  label="Admitted"
                  value={patientData.admissionDate}
                />
                <InfoItem
                  icon={Stethoscope}
                  label="Doctor"
                  value={patientData.doctor}
                />
                <InfoItem
                  icon={BedDouble}
                  label="Room"
                  value={patientData.room}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  )
}

