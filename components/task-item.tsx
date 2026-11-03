import type { inferRouterOutputs } from "@trpc/server"
import Link from "next/link"
import type { AppRouter } from "@/server/routers/_app"

// Inferred from the router so the UI type can never drift from the API.
type Task = inferRouterOutputs<AppRouter>["task"]["list"]["items"][number]

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short"
})

type TaskItemProps = {
  task: Task
  isDeleting: boolean
  canDelete: boolean
  onDelete: () => void
}

// Rendered inside TaskList (a Client Component), so it can use event handlers.
export function TaskItem({ task, isDeleting, canDelete, onDelete }: TaskItemProps) {
  function handleDelete() {
    if (window.confirm(`Delete "${task.titulo}"? This cannot be undone.`)) onDelete()
  }

  return (
    <li className="rounded border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-medium wrap-break-word">{task.titulo}</h2>
          {task.descricao && (
            <p className="mt-1 text-sm wrap-break-word text-gray-600 dark:text-gray-400">{task.descricao}</p>
          )}
          <time
            dateTime={task.dataCriacao.toISOString()}
            suppressHydrationWarning
            className="mt-2 block text-xs text-gray-500"
          >
            {dateFormatter.format(task.dataCriacao)}
          </time>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <Link href={`/tasks/${task.id}`} className="text-blue-600 hover:underline">
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete}
            className="text-red-600 hover:underline disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </li>
  )
}
