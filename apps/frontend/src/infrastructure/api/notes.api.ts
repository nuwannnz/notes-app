import { apiClient } from './client'
import type { Note, NoteWithBlocks } from '@/core/entities'

export interface NoteCreatePayload {
  title: string
  folderId?: string | null
  content?: string
}

export interface NoteUpdatePayload {
  title?: string
  folderId?: string | null
  content?: string
  isPinned?: boolean
  isArchived?: boolean
  isTrashed?: boolean
}

export const notesApi = {
  list: () => apiClient.get<Note[]>('/notes'),

  get: (id: string) => apiClient.get<NoteWithBlocks>(`/notes/${id}`),

  create: (payload: NoteCreatePayload) =>
    apiClient.post<Note>('/notes', payload),

  update: (id: string, payload: NoteUpdatePayload) =>
    apiClient.put<Note>(`/notes/${id}`, payload),

  delete: (id: string) => apiClient.delete(`/notes/${id}`),
}
