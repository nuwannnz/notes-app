import type { StateCreator } from "zustand";
import type { Task, TaskCreateInput, TaskUpdateInput } from "@/core/entities";
import { tasksApi } from "@/infrastructure/api";

export interface TasksSlice {
  tasks: Task[];
  isLoadingTasks: boolean;
  tasksError: string | null;

  // Actions
  loadTasks: (projectId: string) => Promise<void>;
  createTask: (input: TaskCreateInput) => Promise<Task>;
  updateTask: (id: string, input: TaskUpdateInput) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearTasks: () => void;
}

export const createTasksSlice: StateCreator<TasksSlice, [], [], TasksSlice> = (
  set,
  get,
) => ({
  tasks: [],
  isLoadingTasks: false,
  tasksError: null,

  loadTasks: async (projectId: string) => {
    set({ isLoadingTasks: true, tasksError: null });
    try {
      const tasks = await tasksApi.list(projectId);
      set({ tasks, isLoadingTasks: false });
    } catch (error) {
      set({
        isLoadingTasks: false,
        tasksError:
          error instanceof Error ? error.message : "Failed to load tasks",
      });
    }
  },

  createTask: async (input: TaskCreateInput) => {
    const task = await tasksApi.create(input.projectId, {
      title: input.title,
      description: input.description,
    });
    set((state) => ({
      tasks: [...state.tasks, task],
    }));
    return task;
  },

  updateTask: async (id: string, input: TaskUpdateInput) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const updatedTask = await tasksApi.update(task.projectId, id, input);
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
    }));
  },

  toggleTask: async (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task) {
      const updatedTask = await tasksApi.update(task.projectId, id, {
        isCompleted: !task.isCompleted,
      });
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
      }));
    }
  },

  deleteTask: async (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    await tasksApi.delete(task.projectId, id);
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },

  clearTasks: () => {
    set({ tasks: [], isLoadingTasks: false, tasksError: null });
  },
});
