import { apiClient } from './client'
import type { Task } from '@/core/entities'

export interface TaskCreatePayload {
  title: string
  description?: string
}

export interface TaskUpdatePayload {
  title?: string
  description?: string
  isCompleted?: boolean
  position?: number
}

export const tasksApi = {
  list: (projectId: string) =>
    apiClient.get<Task[]>(`/projects/${projectId}/tasks`),

  create: (projectId: string, payload: TaskCreatePayload) =>
    apiClient.post<Task>(`/projects/${projectId}/tasks`, payload),

  update: (projectId: string, taskId: string, payload: TaskUpdatePayload) =>
    apiClient.put<Task>(`/projects/${projectId}/tasks/${taskId}`, payload),

  delete: (projectId: string, taskId: string) =>
    apiClient.delete(`/projects/${projectId}/tasks/${taskId}`),
}
