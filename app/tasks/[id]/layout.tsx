import type { Metadata } from "next"

// The edit page is a Client Component, which cannot export metadata, so the
// page title is set here.
export const metadata: Metadata = { title: "Edit task" }

export default function EditTaskLayout({ children }: { children: React.ReactNode }) {
  return children
}
