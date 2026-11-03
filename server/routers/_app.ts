import { createTRPCRouter } from "../trpc";
import { taskRouter } from "./task";

export const appRouter = createTRPCRouter({
  task: taskRouter,
});

// Only the type is shared with the client, so server code never ends up in the bundle.
export type AppRouter = typeof appRouter;
