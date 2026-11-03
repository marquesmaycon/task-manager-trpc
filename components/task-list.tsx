"use client"

import { useMutation, useQueryClient, useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { useTRPC } from "@/trpc/client"
import { showSuccess } from "@/trpc/feedback-store"
import { TaskItem } from "./task-item"

type TaskListProps = {
  pageSize: number
}

// Client Component because it owns the interactive parts of the list (delete, infinite scroll)
export function TaskList({ pageSize }: TaskListProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.task.list.infiniteQueryOptions(
        { limit: pageSize },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
      )
    )
  const tasks = data.pages.flatMap((page) => page.items)

  // One mutation for the whole list. Feedback goes to the global message:
  // success from here, errors from the QueryClient's global handler.
  const deleteMutation = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => showSuccess("Task deleted."),
      onSettled: () => queryClient.invalidateQueries(trpc.task.list.pathFilter())
    })
  )
  const deletingId = deleteMutation.isPending ? deleteMutation.variables.id : null

  // Loads the next page when an empty element after the last task scrolls into
  // view. The observer is recreated after every fetch: `observe()` reports the
  // current state right away, so if the sentinel is still on screen (the new page
  // was too short to push it away) the next page is requested without more scrolling.
  // It also stops after a failed fetch, so a broken request is not retried in a loop.
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) fetchNextPage()
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage])

  if (tasks.length === 0) {
    return <p className="text-gray-500">No tasks yet. Create your first one!</p>
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isDeleting={deletingId === task.id}
            canDelete={!deleteMutation.isPending}
            onDelete={() => deleteMutation.mutate({ id: task.id })}
          />
        ))}
      </ul>

      <div ref={sentinelRef} aria-hidden="true" />

      <div role="status" className="mt-4 text-center text-sm text-gray-500">
        {isFetchingNextPage && "Loading more tasks..."}
        {isFetchNextPageError && (
          <>
            Could not load more tasks.{" "}
            <button type="button" onClick={() => fetchNextPage()} className="text-blue-600 hover:underline">
              Try again
            </button>
          </>
        )}
        {!hasNextPage && tasks.length > pageSize && "You have reached the end of the list."}
      </div>
    </>
  )
}
