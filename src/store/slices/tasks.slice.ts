import type { StateCreator } from 'zustand'
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/core/entities'
import { taskRepository } from '@/infrastructure/database'

export interface TasksSlice {
  tasks: Task[]
  isLoadingTasks: boolean
  tasksError: string | null

  // Actions
  loadTasks: (projectId: string) => Promise<void>
  createTask: (input: TaskCreateInput) => Promise<Task>
  updateTask: (id: string, input: TaskUpdateInput) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  clearTasks: () => void
}

export const createTasksSlice: StateCreator<TasksSlice, [], [], TasksSlice> = (set, get) => ({
  tasks: [],
  isLoadingTasks: false,
  tasksError: null,

  loadTasks: async (projectId: string) => {
    set({ isLoadingTasks: true, tasksError: null })
    try {
      const tasks = await taskRepository.getByProject(projectId)
      set({ tasks, isLoadingTasks: false })
    } catch (error) {
      set({
        isLoadingTasks: false,
        tasksError: error instanceof Error ? error.message : 'Failed to load tasks'
      })
    }
  },

  createTask: async (input: TaskCreateInput) => {
    const task = await taskRepository.create(input)
    set(state => ({
      tasks: [...state.tasks, task]
    }))
    return task
  },

  updateTask: async (id: string, input: TaskUpdateInput) => {
    const updatedTask = await taskRepository.update(id, input)
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id ? updatedTask : task
      )
    }))
  },

  toggleTask: async (id: string) => {
    const task = get().tasks.find(t => t.id === id)
    if (task) {
      const updatedTask = await taskRepository.update(id, { isCompleted: !task.isCompleted })
      set(state => ({
        tasks: state.tasks.map(t =>
          t.id === id ? updatedTask : t
        )
      }))
    }
  },

  deleteTask: async (id: string) => {
    await taskRepository.delete(id)
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id)
    }))
  },

  clearTasks: () => {
    set({ tasks: [], isLoadingTasks: false, tasksError: null })
  }
})
