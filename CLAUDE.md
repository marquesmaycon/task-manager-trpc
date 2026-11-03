# CLAUDE.md

Instructions for AI agents (Claude Code) working in this repository.

## Context

This project is the **practical part of a technical assessment** for a Software
Engineer position. It is a simple task manager (**task-manager-trpc**) built with Next.js 15
and tRPC, where the backend keeps tasks **in memory** (no database).

Guiding principle from the assessment: **"less is more"**. Prefer simple, readable,
working solutions over elaborate abstractions. Reviewers will read this code, so
clarity beats cleverness.

The repository will be **public**: never add personal data, tokens, passwords or
API keys. All sample data must be fictional.

## Language conventions

- **Model fields stay in Portuguese**, exactly as named in the assessment spec:
  `titulo`, `descricao`, `dataCriacao`. Wherever the model is defined, add a short
  English comment explaining that these names intentionally follow the spec.
- **Everything else is in English**: routers, procedures, components, hooks,
  variables, functions, file names, code comments, UI text, error messages,
  commit messages and the README.

## Stack

- **Next.js 15** (App Router) — pin major version 15, as required by the spec
- **React 19** with function components and hooks
- **TypeScript** in `strict` mode
- **tRPC v11** (`@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`)
- **TanStack Query v5**
- **Zod** for input validation
- **superjson** as the tRPC transformer
- **Tailwind CSS** for styling (simple layout, no elaborate design)
- Package manager: **npm**

Do not add dependencies beyond these without asking first.

## Environment

- Development on **Windows**, PowerShell terminal, VS Code.
- Use PowerShell-compatible commands (e.g. `Remove-Item` instead of `rm -rf`).
- Scripts:
  - `npm run dev` — development server
  - `npm run build` — production build (run before considering a task done)
  - `npm run lint` — lint

## Expected folder structure

```
src/
  app/
    api/trpc/[trpc]/route.ts   # tRPC HTTP handler (fetchRequestHandler)
    page.tsx                   # task list (SSR)
    tasks/new/page.tsx         # create
    tasks/[id]/page.tsx        # edit
    layout.tsx
  components/                  # UI components (TaskList, TaskForm, Feedback...)
  server/
    trpc.ts                    # initTRPC, context, base procedures
    store.ts                   # in-memory storage
    routers/
      _app.ts                  # appRouter + exported AppRouter type
      task.ts                  # task router (CRUD)
  trpc/
    client.tsx                 # client-side provider (QueryClient + tRPC)
    server.tsx                 # server-side helpers (caller / prefetch for SSR)
    query-client.ts            # QueryClient factory
```

## Data model

```ts
// Field names are in Portuguese on purpose: they match the assessment spec
// (titulo = title, descricao = description, dataCriacao = createdAt).
type Task = {
  id: string;           // generated with crypto.randomUUID()
  titulo: string;       // required, non-empty after trim
  descricao?: string;   // optional
  dataCriacao: Date;    // set by the server on creation
};
```

## Backend rules (tRPC)

- Procedures: `task.list`, `task.byId`, `task.create`, `task.update`, `task.delete`.
- Validate every input with **Zod**. `titulo` must use `.trim().min(1, "Title is required")`.
- Errors must be **meaningful**, using `TRPCError` with proper codes:
  - task not found → `NOT_FOUND` ("Task not found")
  - invalid input → `BAD_REQUEST` (produced automatically by Zod)
- Configure an `errorFormatter` that exposes Zod errors in a readable shape for
  the frontend (`zodError: error.cause instanceof ZodError ? error.cause.flatten() : null`).
- **In-memory store**: keep it in a singleton on `globalThis` so data survives
  Next.js hot reload in development. Comment this decision and its limitation
  (data is lost on server restart and is not shared across instances/serverless).
- The store may be seeded with 2–3 fictional sample tasks.
- `list` must support cursor pagination (`{ limit, cursor }` → `{ items, nextCursor }`)
  to enable infinite scroll. Sort by `dataCriacao` descending.

## Frontend rules

- **SSR list page**: the list page is a Server Component that prefetches the first
  page through the tRPC server-side helpers and hands it to the client via
  `HydrationBoundary` (dehydrate). The initial HTML must already contain the tasks.
- Interactivity (delete, infinite scroll) lives in Client Components (`"use client"`),
  kept as small as possible.
- **Delete** directly from the list, with visual feedback (success/error message)
  and query invalidation on success. Ask for confirmation before deleting.
- A single **form** component (`TaskForm`) reused for create and edit, with state
  managed by `useState`. Validate on the client (title required) before submitting
  and also display errors coming from the backend.
- Always handle the three states: **loading** (disabled button / "Saving..." text),
  **success** and **error**.
- **Infinite scroll** (bonus): `useInfiniteQuery` + `IntersectionObserver` on a
  sentinel element at the end of the list.
- Basic accessibility: `label` on inputs, error messages linked to their fields,
  buttons with clear text.

## Code conventions

- Function components only, no classes.
- Avoid `any`. Infer types from `AppRouter` (`inferRouterOutputs`) instead of
  duplicating them.
- Small functions with descriptive names.
- **Comments explain decisions** (why SSR here, why `globalThis`, why a cursor),
  not the obvious. The assessment explicitly values this.
- No dead code, no leftover `console.log`.

## Documentation

Keep a `README.md` (in English) with:
- a short description of the system and its architecture (SSR → hydration → tRPC flow);
- how to install and run it (`npm install`, `npm run dev`);
- technical decisions and known limitations (in-memory storage, Portuguese field names);
- a checklist of the requirements and bonus items covered.

## Agent workflow

1. Before implementing anything large, present a short plan and wait for approval.
2. Work in small steps: tRPC setup → store + router → SSR list → delete
   → form → infinite scroll → README.
3. At the end of each step, run `npm run build` and `npm run lint` and fix errors.
4. Suggest commit messages following Conventional Commits, in English
   (e.g. `feat: add task create procedure`).
5. When torn between two approaches, pick the simpler one and explain why.
