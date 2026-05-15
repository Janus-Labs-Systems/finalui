import { clearLockerOccupy } from "./APIService";

type Task = {
  id: string;
  lockerId: number;
  runAt: number; // epoch ms
  retries: number;
  nextAttemptAt?: number; // epoch ms for next retry
};

const STORAGE_KEY = "advlocker_clear_tasks_v1";
const TICK_INTERVAL_MS = 30 * 1000; // 30s
const MAX_RETRIES = 6;

let tasks: Task[] = [];
let tickHandle: number | null = null;

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [] as Task[];
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("scheduler: failed to load tasks", err);
    return [] as Task[];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("scheduler: failed to save tasks", err);
  }
}

function makeId(lockerId: number, runAt: number) {
  return `task-${lockerId}-${runAt}`;
}

async function runTask(task: Task) {
  try {
    console.log("scheduler: running task", task);
    const ok = await clearLockerOccupy(task.lockerId);
    if (ok) {
      // remove task
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      console.log("scheduler: cleared locker", task.lockerId);
      return;
    }
    throw new Error("clear call failed");
  } catch (err) {
    console.error("scheduler: task run failed", task, err);
    // schedule retry
    task.retries = (task.retries || 0) + 1;
    if (task.retries > MAX_RETRIES) {
      console.error("scheduler: max retries reached for task", task);
      // give up and remove task
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      return;
    }
    // exponential backoff in ms (base 60s)
    const backoff = Math.pow(2, task.retries - 1) * 60 * 1000;
    task.nextAttemptAt = Date.now() + backoff;
    saveTasks();
  }
}

function tick() {
  const now = Date.now();
  tasks.forEach((task) => {
    const when = task.nextAttemptAt ?? task.runAt;
    if (when <= now) {
      // run it (don't await) — runTask handles removal/retries
      runTask(task);
    }
  });
}

export function initScheduler() {
  if (tickHandle != null) return;
  tasks = loadTasks();
  // run immediate overdue tasks
  tick();
  // start periodic tick
  tickHandle = window.setInterval(tick, TICK_INTERVAL_MS);
  console.log("scheduler: initialized, tasks=", tasks.length);
}

export function shutdownScheduler() {
  if (tickHandle != null) {
    clearInterval(tickHandle);
    tickHandle = null;
  }
}

export function scheduleClear(lockerId: number, runAtIso: string) {
  try {
    const runAt = new Date(runAtIso).getTime();
    const id = makeId(lockerId, runAt);
    let existing = tasks.find((t) => t.id === id);
    if (existing) {
      existing.runAt = runAt;
      existing.nextAttemptAt = undefined;
      existing.retries = 0;
    } else {
      existing = { id, lockerId, runAt, retries: 0 };
      tasks.push(existing);
    }
    saveTasks();
    console.log("scheduler: scheduled clear", existing);
    // if scheduler not started, start it
    if (tickHandle == null) initScheduler();
  } catch (err) {
    console.error("scheduler: failed to scheduleClear", err);
  }
}

export function listScheduled(): Task[] {
  return tasks.slice();
}

export function cancelScheduled(lockerId: number, runAtIso?: string) {
  try {
    if (runAtIso) {
      const runAt = new Date(runAtIso).getTime();
      const id = makeId(lockerId, runAt);
      tasks = tasks.filter((t) => t.id !== id);
    } else {
      tasks = tasks.filter((t) => t.lockerId !== lockerId);
    }
    saveTasks();
  } catch (err) {
    console.error("scheduler: failed to cancelScheduled", err);
  }
}

export default {
  initScheduler,
  shutdownScheduler,
  scheduleClear,
  listScheduled,
  cancelScheduled,
};
