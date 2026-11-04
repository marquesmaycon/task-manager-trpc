"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { use } from "react"
import { TaskForm } from "@/components/task-form"
import { useTRPC } from "@/trpc/client"

type EditTaskPageProps = {
  params: Promise<{ id: string }>
}

// Unlike the list, this page loads the task in the browser, through /api/trpc: the
// same route that creates and deletes tasks. With in-memory storage on serverless,
// a page rendered on the server can run on another instance with its own memory
// and miss tasks created through the API. With a database it would load on the server.
export default function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = use(params)
  const trpc = useTRPC()
  // No retries: "Task not found" will not change by asking again.
  const { data: task, error, isPending } = useQuery(
    trpc.task.byId.queryOptions({ id }, { retry: false })
  )

  return (
    <main className="mx-auto max-w-2xl p-6 font-sans">
      <h1 className="mb-6 text-2xl font-semibold">Edit task</h1>
      {isPending ? (
        <p className="text-gray-500">Loading task...</p>
      ) : error ? (
        <div role="alert" className="flex flex-col gap-2">
          <p className="text-red-600">{error.message}</p>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Back to tasks
          </Link>
        </div>
      ) : (
        <TaskForm task={task} />
      )}
    </main>
  )
}
