import Link from "next/link"
import { HydrateClient, getQueryClient, trpc } from "@/trpc/server"
import { TaskList } from "@/components/task-list"

// Tasks live in server memory and change at runtime, so the page must be
// rendered on every request instead of being frozen at build time.
export const dynamic = "force-dynamic"

// Passed down to TaskList so the client reads exactly the query prefetched here.
const TASKS_PAGE_SIZE = 5

// Server Component: only the first page is fetched on the server and dehydrated
// into the HTML, so tasks show up without a loading state. The next pages are
// loaded by the client as the user scrolls (infinite scroll in TaskList).
export default async function HomePage() {
  await getQueryClient().infiniteQuery(
    trpc.task.list.infiniteQueryOptions(
      { limit: TASKS_PAGE_SIZE },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    )
  )

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
