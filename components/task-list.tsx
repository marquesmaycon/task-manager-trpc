"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { TaskItem } from "./task-item"

type TaskListProps = {
  pageSize: number
}

// Client Component so it can later handle delete and infinite scroll
export function TaskList({ pageSize }: TaskListProps) {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.task.list.queryOptions({ limit: pageSize }))

  if (data.items.length === 0) {
    return <p className="text-gray-500">No tasks yet. Create your first one!</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.items.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}
