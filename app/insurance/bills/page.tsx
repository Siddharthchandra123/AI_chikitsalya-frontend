import { redirect } from "next/navigation"

export default function BillsPage() {
  redirect("/insurance/documents?section=bills")
}
