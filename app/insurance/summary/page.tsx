import { redirect } from "next/navigation"

export default function SummaryPage() {
  redirect("/insurance/documents?section=summary")
}
