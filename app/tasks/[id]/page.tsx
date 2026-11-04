import { TRPCError } from "@trpc/server"
import Link from "next/link"
import { TaskForm } from "@/components/task-form"
import { getQueryClient, trpc } from "@/trpc/server"

// Tasks change at runtime, so the page is rendered on every request.
export const dynamic = "force-dynamic"

type EditTaskPageProps = {
  params: Promise<{ id: string }>
}

// Server Component: the task is fetched on the server (router called directly, no
// HTTP round-trip) so the form is already filled in the initial HTML.
// Caveat: with in-memory storage on serverless, this render may run on an instance
// with its own memory and miss a task created through another one.
export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params
  const task = await fetchTask(id)

  return (
    <main className="mx-auto max-w-2xl p-6 font-sans">
      <h1 className="mb-6 text-2xl font-semibold">Edit task</h1>
      {task ? (
        <TaskForm task={task} />
      ) : (
        <div role="alert" className="flex flex-col gap-2">
          <p className="text-red-600">Task not found</p>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Back to tasks
          </Link>
        </div>
      )}
    </main>
  )
}

// Returns null for NOT_FOUND so the page can show a friendly message; any other
// error is rethrown to Next.js's error handling.
async function fetchTask(id: string) {
  try {
    return await getQueryClient().query(trpc.task.byId.queryOptions({ id }))
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") return null
    throw error
  }
}
