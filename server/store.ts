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
