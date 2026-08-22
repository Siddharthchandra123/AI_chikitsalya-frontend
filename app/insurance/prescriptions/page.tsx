import { redirect } from "next/navigation"

export default function PrescriptionsPage() {
  redirect("/insurance/care-plan?section=prescriptions")
}
