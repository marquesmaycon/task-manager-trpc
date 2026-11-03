"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { showSuccess } from "@/trpc/feedback-store"
import { TaskItem } from "./task-item"

type TaskListProps = {
  pageSize: number
}

// Client Component because it owns the interactive parts of the list (delete)
export function TaskList({ pageSize }: TaskListProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(trpc.task.list.queryOptions({ limit: pageSize }))

  // One mutation for the whole list. Feedback goes to the global message:
  // success from here, errors from the QueryClient's global handler.
  const deleteMutation = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => showSuccess("Task deleted."),
      onSettled: () => queryClient.invalidateQueries(trpc.task.list.pathFilter())
    })
  )
  const deletingId = deleteMutation.isPending ? deleteMutation.variables.id : null

  return (
    <>
      {data.items.length === 0 ? (
        <p className="text-gray-500">No tasks yet. Create your first one!</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.items.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isDeleting={deletingId === task.id}
              canDelete={!deleteMutation.isPending}
              onDelete={() => deleteMutation.mutate({ id: task.id })}
            />
          ))}
        </ul>
      )}
    </>
  )
}
