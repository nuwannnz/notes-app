import { apiClient } from './client'
import type { Project } from '@/core/entities'

export interface ProjectCreatePayload {
  name: string
  description?: string
  color?: string
}

export interface ProjectUpdatePayload {
  name?: string
  description?: string
  color?: string
}

export const projectsApi = {
  list: () => apiClient.get<Project[]>('/projects'),

  create: (payload: ProjectCreatePayload) =>
    apiClient.post<Project>('/projects', payload),

  update: (id: string, payload: ProjectUpdatePayload) =>
    apiClient.put<Project>(`/projects/${id}`, payload),

  delete: (id: string) => apiClient.delete(`/projects/${id}`),
}
