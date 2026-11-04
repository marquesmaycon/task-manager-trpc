import { MutationCache, QueryClient } from "@tanstack/react-query"
import { TRPCClientError } from "@trpc/client"
import superjson from "superjson"
import type { AppRouter } from "@/server/routers/_app"
import { clearFeedback, showError } from "./feedback-store"

// Turns any mutation error into one readable message. Zod validation errors come
// first (see `errorFormatter` in `server/trpc.ts`), then the `TRPCError` message.
function getErrorMessage(error: unknown): string {
  if (!(error instanceof TRPCClientError)) return "Something went wrong. Please try again."

  const zodError = (error as TRPCClientError<AppRouter>).data?.zodError
  if (!zodError) return error.message

  // The formatter flattens an untyped ZodError, so its field values are widened here.
  const fieldErrors: Record<string, string[] | undefined> = zodError.fieldErrors
  const firstZodMessage = Object.values(fieldErrors).flat()[0] ?? zodError.formErrors[0]

  return firstZodMessage ?? error.message
}

export function makeQueryClient() {
  return new QueryClient({
    // Handling mutation errors in one place keeps components free of error
    // parsing. Starting a new mutation clears the previous feedback message.
    mutationCache: new MutationCache({
      onMutate: () => clearFeedback(),
      onError: (error) => showError(getErrorMessage(error))
    }),
    defaultOptions: {
      queries: {
        // With SSR the data is already fresh on first render; a small stale time
        // stops the client from refetching it right after hydration.
        staleTime: 30 * 1000
      },
      // superjson is used here too so `Date` fields survive the server → client
      // handoff done by `dehydrate` / `HydrationBoundary`.
      dehydrate: {
        serializeData: superjson.serialize
      },
      hydrate: {
        deserializeData: superjson.deserialize
      }
    }
  })
}
