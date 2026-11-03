// Field names are in Portuguese on purpose: they match the assessment spec
// (titulo = title, descricao = description, dataCriacao = createdAt).
export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
};

type TaskInput = Pick<Task, "titulo" | "descricao">;

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000);
}

function createSeed(): Map<string, Task> {
  const seed: Task[] = [
    {
      id: crypto.randomUUID(),
      titulo: "Review pull request",
      descricao: "Check the new task form and leave comments.",
      dataCriacao: minutesAgo(30),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Buy coffee",
      dataCriacao: minutesAgo(60),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Plan sprint",
      descricao: "List the goals for next week.",
      dataCriacao: minutesAgo(120),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Update project README",
      descricao: "Document how to run the app locally.",
      dataCriacao: minutesAgo(180),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Fix login page typo",
      dataCriacao: minutesAgo(240),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Prepare demo for Friday",
      descricao: "Walk through creating, editing and deleting tasks.",
      dataCriacao: minutesAgo(360),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Water the plants",
      dataCriacao: minutesAgo(480),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Book dentist appointment",
      descricao: "Any morning next week works.",
      dataCriacao: minutesAgo(720),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Write unit tests for the store",
      dataCriacao: minutesAgo(1440),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Clean up old branches",
      descricao: "Delete branches that were already merged.",
      dataCriacao: minutesAgo(2880),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Renew library books",
      dataCriacao: minutesAgo(3000),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Refactor date helpers",
      descricao: "Move the formatting logic to a single place.",
      dataCriacao: minutesAgo(3600),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Call the internet provider",
      dataCriacao: minutesAgo(4320),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Read chapter 3 of the TypeScript book",
      descricao: "Focus on generics and utility types.",
      dataCriacao: minutesAgo(5040),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Organize desk drawers",
      dataCriacao: minutesAgo(5760),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Set up CI pipeline",
      descricao: "Run lint and build on every pull request.",
      dataCriacao: minutesAgo(7200),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Plan weekend trip",
      dataCriacao: minutesAgo(8640),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Review accessibility of the form",
      descricao: "Check labels, focus order and error messages.",
      dataCriacao: minutesAgo(10080),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Pay electricity bill",
      dataCriacao: minutesAgo(11520),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Archive old meeting notes",
      dataCriacao: minutesAgo(14400),
    },
  ];
  return new Map(seed.map((task) => [task.id, task]));
}

// The store lives on `globalThis` because Next.js re-evaluates modules on every
// hot reload in development, which would otherwise wipe the tasks on each edit.
// Limitation: data is still lost when the server restarts, and it is not shared
// across multiple instances or serverless invocations. A real app would use a database.
const globalForStore = globalThis as unknown as { taskStore?: Map<string, Task> };
const tasks = (globalForStore.taskStore ??= createSeed());

export function listTasks(): Task[] {
  return [...tasks.values()].sort(
    (a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime(),
  );
}

export function findTask(id: string): Task | undefined {
  return tasks.get(id);
}

export function createTask(input: TaskInput): Task {
  const task: Task = { id: crypto.randomUUID(), ...input, dataCriacao: new Date() };
  tasks.set(task.id, task);
  return task;
}

export function updateTask(id: string, input: TaskInput): Task | undefined {
  const existing = tasks.get(id);
  if (!existing) return undefined;
  const updated: Task = { ...existing, ...input };
  tasks.set(id, updated);
  return updated;
}

export function deleteTask(id: string): boolean {
  return tasks.delete(id);
}
