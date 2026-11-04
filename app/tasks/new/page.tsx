import type { Metadata } from "next"
import { TaskForm } from "@/components/task-form"

export const metadata: Metadata = { title: "New task" }

export default function NewTaskPage() {
  return (
    <main className="mx-auto max-w-2xl p-6 font-sans">
      <h1 className="mb-6 text-2xl font-semibold">New task</h1>
      <TaskForm />
    </main>
  )
}
