// A tiny store holding the current global feedback message (success or error).
export type FeedbackMessage = {
  type: "success" | "error"
  text: string
}

// Messages hide themselves after this delay so they never pile up on screen.
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
