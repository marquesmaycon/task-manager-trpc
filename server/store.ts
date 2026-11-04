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

// Seed tasks get fixed ids instead of random UUIDs: in serverless each instance
// builds its own seed, and the list and edit pages may run on different instances.
// Fixed ids keep a seed task's link valid no matter which instance serves it.
function createSeed(): Map<string, Task> {
  const seed: Omit<Task, "id">[] = [
    {
      titulo: "Review pull request",
      descricao: "Check the new task form and leave comments.",
      dataCriacao: minutesAgo(30),
    },
    {
      titulo: "Buy coffee",
      dataCriacao: minutesAgo(60),
    },
    {
      titulo: "Plan sprint",
      descricao: "List the goals for next week.",
      dataCriacao: minutesAgo(120),
    },
    {
      titulo: "Update project README",
      descricao: "Document how to run the app locally.",
      dataCriacao: minutesAgo(180),
    },
    {
      titulo: "Fix login page typo",
      dataCriacao: minutesAgo(240),
    },
    {
      titulo: "Prepare demo for Friday",
      descricao: "Walk through creating, editing and deleting tasks.",
      dataCriacao: minutesAgo(360),
    },
    {
      titulo: "Water the plants",
      dataCriacao: minutesAgo(480),
    },
    {
      titulo: "Book dentist appointment",
      descricao: "Any morning next week works.",
      dataCriacao: minutesAgo(720),
    },
    {
      titulo: "Write unit tests for the store",
      dataCriacao: minutesAgo(1440),
    },
    {
      titulo: "Clean up old branches",
      descricao: "Delete branches that were already merged.",
      dataCriacao: minutesAgo(2880),
    },
    {
      titulo: "Renew library books",
      dataCriacao: minutesAgo(3000),
    },
    {
      titulo: "Refactor date helpers",
      descricao: "Move the formatting logic to a single place.",
      dataCriacao: minutesAgo(3600),
    },
    {
      titulo: "Call the internet provider",
      dataCriacao: minutesAgo(4320),
    },
    {
      titulo: "Read chapter 3 of the TypeScript book",
      descricao: "Focus on generics and utility types.",
      dataCriacao: minutesAgo(5040),
    },
    {
      titulo: "Organize desk drawers",
      dataCriacao: minutesAgo(5760),
    },
    {
      titulo: "Set up CI pipeline",
      descricao: "Run lint and build on every pull request.",
      dataCriacao: minutesAgo(7200),
    },
    {
      titulo: "Plan weekend trip",
      dataCriacao: minutesAgo(8640),
    },
    {
      titulo: "Review accessibility of the form",
      descricao: "Check labels, focus order and error messages.",
      dataCriacao: minutesAgo(10080),
    },
    {
      titulo: "Pay electricity bill",
      dataCriacao: minutesAgo(11520),
    },
    {
      titulo: "Archive old meeting notes",
      dataCriacao: minutesAgo(14400),
    },
  ];
  return new Map(
    seed.map((task, index) => {
      const id = `seed-${index + 1}`;
      return [id, { id, ...task }];
    }),
  );
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
