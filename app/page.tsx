import Link from "next/link"
import { HydrateClient, getQueryClient, trpc } from "@/trpc/server"
import { TaskList } from "@/components/task-list"

// Tasks live in server memory and change at runtime, so the page must be
// rendered on every request instead of being frozen at build time.
export const dynamic = "force-dynamic"

// Passed down to TaskList so the client reads exactly the query prefetched here.
const TASKS_PAGE_SIZE = 10

// Server Component: the first page is fetched on the server and dehydrated into
// the HTML, so tasks show up without a loading state or an extra client request.
export default async function HomePage() {
  await getQueryClient().query(trpc.task.list.queryOptions({ limit: TASKS_PAGE_SIZE }))

  return (
    <main className="mx-auto max-w-2xl p-6 font-sans">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <Link
          href="/tasks/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New task
        </Link>
      </header>

      <HydrateClient>
        <TaskList pageSize={TASKS_PAGE_SIZE} />
      </HydrateClient>
    </main>
  )
}
