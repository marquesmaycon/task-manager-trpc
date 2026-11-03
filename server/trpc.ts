import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

// No auth or per-request data is needed yet, so the context is empty. It still
// exists so the HTTP handler and the server-side caller share the same entry point.
export async function createTRPCContext() {
  return {};
}

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  // superjson keeps `Date` objects (e.g. `dataCriacao`) intact across the wire
  // and through SSR hydration, instead of turning them into strings.
  transformer: superjson,
  // Exposes Zod validation errors in a flat, field-keyed shape so the form can
  // show each message next to the matching input.
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
