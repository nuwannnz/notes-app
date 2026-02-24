import { apiClient } from './client'
import type { Folder } from '@/core/entities'

export interface FolderCreatePayload {
  name: string
  parentId?: string | null
  icon?: string
  color?: string
}

export interface FolderUpdatePayload {
  name?: string
  parentId?: string | null
  icon?: string
  color?: string
  isExpanded?: boolean
  position?: number
}

export const foldersApi = {
  list: () => apiClient.get<Folder[]>('/folders'),

  create: (payload: FolderCreatePayload) =>
    apiClient.post<Folder>('/folders', payload),

  update: (id: string, payload: FolderUpdatePayload) =>
    apiClient.put<Folder>(`/folders/${id}`, payload),

  delete: (id: string) => apiClient.delete(`/folders/${id}`),
}
