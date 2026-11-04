// A plain module store instead of React Context: errors are reported by the
// QueryClient's MutationCache, which lives outside the React tree. Components
// read it with `useSyncExternalStore`.
export type FeedbackMessage = {
  type: "success" | "error"
  text: string
}

const AUTO_DISMISS_MS = 5000

let current: FeedbackMessage | null = null
let dismissTimer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

function setFeedback(next: FeedbackMessage | null) {
  // A new message restarts the countdown instead of being cut short by the old one.
  clearTimeout(dismissTimer)
  if (next) dismissTimer = setTimeout(() => setFeedback(null), AUTO_DISMISS_MS)

  current = next
  listeners.forEach((listener) => listener())
}

export function showSuccess(text: string) {
  setFeedback({ type: "success", text })
}

export function showError(text: string) {
  setFeedback({ type: "error", text })
}

export function clearFeedback() {
  setFeedback(null)
}

export function getFeedback() {
  return current
}

export function subscribeFeedback(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
