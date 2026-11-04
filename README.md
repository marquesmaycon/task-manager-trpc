# Task Manager tRPC

A simple task manager built with **Next.js 15** and **tRPC**. You can list, create, edit
and delete tasks. The backend keeps tasks **in memory**, so there is no database.

**Live demo:** https://task-manager-trpc-taupe.vercel.app/

## Features

- **Task list rendered on the server (SSR).** The first page of tasks is already in the
  initial HTML, so there is no loading spinner on first visit.
- **Infinite scroll.** More tasks load as you reach the end of the list.
- **Create and edit** with one shared form, validated on the client and on the server.
- **Delete from the list**, with a confirmation prompt first.
- **Feedback for every action.** Buttons are disabled and show "Saving..." or "Deleting..."
  while a request runs. A success or error message appears afterwards and hides itself
  after a few seconds.
- **Meaningful errors.** Unknown tasks return `NOT_FOUND`, and the edit page shows a 404.
  Invalid input returns `BAD_REQUEST` with the Zod message, for example "Title is required".
- **Basic accessibility.** Inputs have labels, field errors are linked to their inputs,
  and messages are announced to screen readers.

## Tech stack

- Next.js 15 (App Router) and React 19
- TypeScript (strict mode)
- tRPC v11 with TanStack Query v5 (`@trpc/tanstack-react-query`)
- Zod for input validation
- superjson as the tRPC transformer
- Tailwind CSS

## How it works

```
Server Component (app/page.tsx)
  │  calls the tRPC router directly (no HTTP) and prefetches the first page
  ▼
QueryClient (one per request) ──dehydrate──► HTML + serialized cache
                                                  │
                                                  ▼
                              HydrationBoundary fills the browser cache
                                                  │
                                                  ▼
               Client Components (TaskList, TaskForm) read that cache and
               make every later request over HTTP to /api/trpc
```

1. **Server.** `app/page.tsx` is a Server Component. It uses the server-side helpers in
   `trpc/server.tsx` to call the router in-process and stores the result in a QueryClient
   that lives only for that request.
2. **Hydration.** `HydrateClient` dehydrates that QueryClient into the page. In the
   browser, `TaskList` finds the data already in its cache and renders it without
   fetching again.
3. **Client.** Everything after that (loading more pages, create, update, delete) goes
   through the tRPC client in `trpc/client.tsx` to the HTTP handler at
   `app/api/trpc/[trpc]/route.ts`. After a mutation, the related queries are invalidated
   so the list refreshes.

### Project structure

```
app/
  api/trpc/[trpc]/route.ts   tRPC HTTP handler
  page.tsx                   task list (SSR + hydration)
  tasks/new/page.tsx         create page
  tasks/[id]/page.tsx        edit page (task loaded on the server)
  layout.tsx                 providers, header, global feedback
components/
  task-list.tsx              list, delete, infinite scroll
  task-item.tsx              one task row
  task-form.tsx              form shared by create and edit
  feedback.tsx               global success/error message
server/
  trpc.ts                    initTRPC, superjson, error formatter
  store.ts                   in-memory storage and sample data
  routers/_app.ts            root router and the AppRouter type
  routers/task.ts            task procedures (list, byId, create, update, delete)
trpc/
  client.tsx                 browser provider (QueryClient + tRPC client)
  server.tsx                 server-side helpers for prefetching
  query-client.ts            QueryClient factory and global mutation error handler
  feedback-store.ts          small store behind the feedback message
```

### API

| Procedure     | Type     | Input                              | Output                  |
| ------------- | -------- | ---------------------------------- | ----------------------- |
| `task.list`   | query    | `{ limit?, cursor? }`              | `{ items, nextCursor }` |
| `task.byId`   | query    | `{ id }`                           | `Task`                  |
| `task.create` | mutation | `{ titulo, descricao? }`           | `Task`                  |
| `task.update` | mutation | `{ id, titulo, descricao? }`       | `Task`                  |
| `task.delete` | mutation | `{ id }`                           | `{ id }`                |

```ts
type Task = {
  id: string;          // crypto.randomUUID()
  titulo: string;      // required
  descricao?: string;  // optional
  dataCriacao: Date;   // set by the server
};
```

## Main decisions

- **In-memory store on `globalThis`.** Next.js re-runs modules on every hot reload in
  development. Keeping the `Map` on `globalThis` stops the tasks from being wiped on each
  edit. The store starts with fictional sample tasks so the list and infinite scroll can
  be tried right away.
- **Cursor pagination instead of offset.** The cursor is the `dataCriacao` of the last task
  loaded. Tasks can be deleted or created between page loads; with an offset, that would
  skip or repeat items. Tasks are sorted newest first.
- **superjson.** It keeps `dataCriacao` as a real `Date` across HTTP and through SSR
  hydration, so the UI never has to parse date strings.
- **Validation on both sides.** The form checks the title before sending, for instant
  feedback next to the field. The server checks again with Zod, because the client can't
  be trusted. An `errorFormatter` sends Zod errors to the client in a flat shape.
- **Errors handled in one place.** A `MutationCache` in the QueryClient turns any mutation
  error into a readable message. Components only handle their own success case.
- **One form for create and edit.** `TaskForm` edits a task when it receives one and
  creates a new task otherwise. State is kept with `useState`, since the form has two
  fields and doesn't need a form library.
- **Types inferred from the router.** The UI types come from `inferRouterOutputs<AppRouter>`,
  so they can't drift from the API. Only the router's *type* is imported on the client,
  so no server code ends up in the browser bundle.
- **Small Client Components.** Pages are Server Components. Only the parts that need
  interactivity (list, form, feedback) use `"use client"`.

## Known limitations

- **Data is not persisted.** Tasks are lost when the server restarts. On Vercel (the live
  demo), each serverless instance has its own memory, so changes may disappear or differ
  between requests. A real app would use a database.
- **Model fields are in Portuguese** (`titulo`, `descricao`, `dataCriacao`) on purpose,
  to match the assessment spec. The rest of the code and the UI are in English.
- No authentication: every visitor sees and edits the same tasks.
- No automated tests.

## Running locally

Requirements: **Node.js 18.18 or newer** and **npm**.

```bash
git clone https://github.com/marquesmaycon/task-manager-trpc.git
cd task-manager-trpc
npm install
npm run dev
```

Open http://localhost:3000.

Other scripts:

| Command         | What it does                       |
| --------------- | ---------------------------------- |
| `npm run build` | Production build                   |
| `npm run start` | Serve the production build         |
| `npm run lint`  | Run ESLint                         |

No environment variables are needed.