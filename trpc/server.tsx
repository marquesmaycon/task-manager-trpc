import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";
import { makeQueryClient } from "./query-client";

// `cache` gives one QueryClient per server request, shared by every Server
// Component that renders as part of that request.
export const getQueryClient = cache(makeQueryClient);

// Server Components call the router directly (no HTTP round-trip) and store the
// result in the request's QueryClient, ready to be dehydrated.
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

// Sends the data prefetched on the server to the client cache, so Client
// Components render with it immediately instead of fetching again.
export function HydrateClient({ children }: { children: React.ReactNode }) {
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>{children}</HydrationBoundary>
  );
}
