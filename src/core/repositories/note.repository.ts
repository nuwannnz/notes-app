import type { Note, NoteCreateInput, NoteUpdateInput } from '../entities'

export interface INoteRepository {
  getAll(ownerId: string): Promise<Note[]>
  getById(id: string): Promise<Note | undefined>
  getByFolder(folderId: string | null): Promise<Note[]>
  create(ownerId: string, input: NoteCreateInput): Promise<Note>
  update(id: string, input: NoteUpdateInput): Promise<Note>
  delete(id: string): Promise<void>
  search(ownerId: string, query: string): Promise<Note[]>
}
