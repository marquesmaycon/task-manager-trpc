import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR the data is already fresh on first render; a small stale time
        // stops the client from refetching it right after hydration.
        staleTime: 30 * 1000,
      },
      // superjson is used here too so `Date` fields survive the server → client
      // handoff done by `dehydrate` / `HydrationBoundary`.
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
