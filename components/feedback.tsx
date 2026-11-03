"use client"

import { useSyncExternalStore } from "react"
import { clearFeedback, getFeedback, subscribeFeedback } from "@/trpc/feedback-store"

const styles = {
  success: "bg-green-50 text-green-700",
  error: "bg-red-50 text-red-700"
}

// Shows the global success/error message: errors come from the QueryClient's
// mutation error handler, successes from each mutation's `onSuccess`.
export function Feedback() {
  // The server snapshot is always null: feedback only follows user actions.
  const feedback = useSyncExternalStore(subscribeFeedback, getFeedback, () => null)

  if (!feedback) return null

  return (
    <div
      // Errors interrupt screen readers; successes are announced politely.
      role={feedback.type === "error" ? "alert" : "status"}
      className={`fixed inset-x-4 bottom-4 mx-auto flex max-w-xl items-start justify-between gap-4 rounded p-3 text-sm shadow ${styles[feedback.type]}`}
    >
      <span>{feedback.text}</span>
      <button type="button" onClick={clearFeedback} className="font-medium hover:underline">
        Dismiss
      </button>
    </div>
  )
}
