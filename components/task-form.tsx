"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { inferRouterOutputs } from "@trpc/server"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { AppRouter } from "@/server/routers/_app"
import { useTRPC } from "@/trpc/client"
import { showSuccess } from "@/trpc/feedback-store"

type Task = inferRouterOutputs<AppRouter>["task"]["byId"]

type TaskFormProps = {
  task?: Task
}

export function TaskForm({ task }: TaskFormProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [titulo, setTitulo] = useState(task?.titulo ?? "")
  const [descricao, setDescricao] = useState(task?.descricao ?? "")
  const [titleError, setTitleError] = useState<string | null>(null)

  // pathFilter() covers both list and byId, so the edited task is never stale.
  const onSettled = () => queryClient.invalidateQueries(trpc.task.pathFilter())

  const onSuccessGoToList = (message: string) => () => {
    showSuccess(message)
    router.push("/")
  }

  const createMutation = useMutation(
    trpc.task.create.mutationOptions({ onSettled, onSuccess: onSuccessGoToList("Task created.") })
  )
  const updateMutation = useMutation(
    trpc.task.update.mutationOptions({ onSettled, onSuccess: onSuccessGoToList("Task updated.") })
  )
  const mutation = task ? updateMutation : createMutation

  // Stays disabled after success so the form cannot be sent twice while navigating.
  const isBusy = mutation.isPending || mutation.isSuccess

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    // Instant feedback next to the field. The server validates again and any
    // error it returns is shown by the QueryClient's global handler.
    if (!titulo.trim()) {
      setTitleError("Title is required")
      return
    }

    const data = { titulo, descricao }
    if (task) {
      updateMutation.mutate({ id: task.id, ...data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="titulo" className="text-sm font-medium">
          Title
        </label>
        <input
          id="titulo"
          value={titulo}
          onChange={(event) => {
            setTitulo(event.target.value)
            setTitleError(null)
          }}
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? "titulo-error" : undefined}
          className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
        />
        {titleError && (
          <p id="titulo-error" className="text-sm text-red-600">
            {titleError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="descricao" className="text-sm font-medium">
          Description <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          rows={4}
          className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isBusy}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : task ? "Save changes" : "Create task"}
        </button>
        <Link href="/" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
          Cancel
        </Link>
      </div>
    </form>
  )
}
