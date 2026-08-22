"use client"

import { motion } from "framer-motion"
import {
  CreditCard,
  Download,
  Shield,
  IndianRupee,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const billData = {
  total: 125000,
  insuranceCovered: 87500,
  remaining: 37500,
  expenses: [
    { label: "Room Charges", amount: 35000 },
    { label: "Medical Tests", amount: 28000 },
    { label: "Medications", amount: 15000 },
    { label: "Doctor Fees", amount: 25000 },
    { label: "Surgery", amount: 22000 },
  ],
}

export function BillsCard() {
  const insurancePercentage = (billData.insuranceCovered / billData.total) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="h-full border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Bills & Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Total Bill</p>
              <p className="text-lg font-bold text-foreground flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
                {billData.total.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-success/10">
              <p className="text-xs text-muted-foreground mb-1">Insurance</p>
              <p className="text-lg font-bold text-success flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
                {billData.insuranceCovered.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-warning/10">
              <p className="text-xs text-muted-foreground mb-1">Remaining</p>
              <p className="text-lg font-bold text-warning flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
                {billData.remaining.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Insurance Coverage</span>
              <span className="font-medium text-foreground">{Math.round(insurancePercentage)}%</span>
            </div>
            <Progress value={insurancePercentage} className="h-2" />
          </div>

          {/* Expense Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Breakdown</h4>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {billData.expenses.map((expense, index) => (
                <motion.div
                  key={expense.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="flex justify-between text-sm py-1.5 border-b border-border last:border-0"
                >
                  <span className="text-muted-foreground">{expense.label}</span>
                  <span className="font-medium text-foreground flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {expense.amount.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
              Pay Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Invoice
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Shield className="w-4 h-4 mr-2" />
                Claim
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

