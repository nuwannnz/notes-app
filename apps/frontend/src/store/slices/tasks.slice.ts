import type { StateCreator } from 'zustand'
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/core/entities'
import { taskRepository } from '@/infrastructure/database'
import { syncEngine } from '@/services/sync/SyncEngine'

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
    syncEngine.write({
      entityType: 'task',
      entityId: task.id,
      operation: 'create',
      payload: { projectId: task.projectId, title: task.title, description: task.description },
    }).catch(console.error)
    return task
  },

  updateTask: async (id: string, input: TaskUpdateInput) => {
    const updatedTask = await taskRepository.update(id, input)
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id ? updatedTask : task
      )
    }))
    const task = get().tasks.find(t => t.id === id)
    syncEngine.write({
      entityType: 'task',
      entityId: id,
      operation: 'update',
      payload: { projectId: task?.projectId, ...input as Record<string, unknown> },
    }).catch(console.error)
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
      syncEngine.write({
        entityType: 'task',
        entityId: id,
        operation: 'update',
        payload: { projectId: task.projectId, isCompleted: !task.isCompleted },
      }).catch(console.error)
    }
  },

  deleteTask: async (id: string) => {
    const task = get().tasks.find(t => t.id === id)
    await taskRepository.delete(id)
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id)
    }))
    if (task) {
      syncEngine.write({
        entityType: 'task',
        entityId: id,
        operation: 'delete',
        payload: { projectId: task.projectId },
      }).catch(console.error)
    }
  },

  clearTasks: () => {
    set({ tasks: [], isLoadingTasks: false, tasksError: null })
  }
})
