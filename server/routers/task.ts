import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTask,
  deleteTask,
  findTask,
  listTasks,
  updateTask,
  type Task,
} from "../store";
import { createTRPCRouter, publicProcedure } from "../trpc";

const taskInput = z.object({
  titulo: z.string().trim().min(1, "Title is required"),
  // An empty description is stored as "no description" rather than "".
  descricao: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
});

const idInput = z.object({ id: z.string().min(1) });

function notFound(): never {
  throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
}

export const taskRouter = createTRPCRouter({
  // The cursor is the `dataCriacao` timestamp of the last task already loaded.
  // Unlike an offset, it does not skip or repeat tasks when others are created or
  // deleted between page loads. Limitation: tasks created in the same millisecond
  // would share a cursor; acceptable for an in-memory demo.
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
        cursor: z.number().nullish(),
      }),
    )
    .query(({ input }) => {
      const { limit, cursor } = input;
      const remaining =
        cursor == null
          ? listTasks()
          : listTasks().filter((task) => task.dataCriacao.getTime() < cursor);

      const items = remaining.slice(0, limit);
      const hasMore = remaining.length > limit;
      const nextCursor = hasMore ? items[items.length - 1].dataCriacao.getTime() : null;

      return { items, nextCursor };
    }),

  byId: publicProcedure.input(idInput).query(({ input }): Task => {
    return findTask(input.id) ?? notFound();
  }),

  create: publicProcedure.input(taskInput).mutation(({ input }) => {
    return createTask(input);
  }),

  update: publicProcedure
    .input(taskInput.extend(idInput.shape))
    .mutation(({ input: { id, ...data } }): Task => {
      return updateTask(id, data) ?? notFound();
    }),

  delete: publicProcedure.input(idInput).mutation(({ input }) => {
    if (!deleteTask(input.id)) notFound();
    return { id: input.id };
  }),
});
