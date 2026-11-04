import type { Metadata } from "next"
import { TRPCError } from "@trpc/server"
import { notFound } from "next/navigation"
import { TaskForm } from "@/components/task-form"
import { getQueryClient, trpc } from "@/trpc/server"

export const metadata: Metadata = { title: "Edit task" }

type EditTaskPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params
  const task = await getQueryClient()
    .query(trpc.task.byId.queryOptions({ id }))
    .catch((error: unknown) => {
      if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound()
      throw error
    })

  return (
    <main className="mx-auto max-w-2xl p-6 font-sans">
      <h1 className="mb-6 text-2xl font-semibold">Edit task</h1>
      <TaskForm task={task} />
    </main>
  )
}
