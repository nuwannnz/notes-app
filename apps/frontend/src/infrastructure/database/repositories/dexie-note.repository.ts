import type { INoteRepository } from '@/core/repositories'
import type { Note, NoteCreateInput, NoteUpdateInput } from '@/core/entities'
import { createNotePK, createNoteSK } from '@/core/entities'
import { db } from '../dexie/db'
import { generateId } from '@/utils'

export class DexieNoteRepository implements INoteRepository {
  async getAll(ownerId: string): Promise<Note[]> {
    return db.notes
      .where('ownerId')
      .equals(ownerId)
      .and(note => !note.isTrashed)
      .sortBy('updatedAt')
      .then(notes => notes.reverse())
  }

  async getById(id: string): Promise<Note | undefined> {
    return db.notes.get(id)
  }

  async getByFolder(folderId: string | null): Promise<Note[]> {
    if (folderId === null) {
      return db.notes
        .where('folderId')
        .equals('')
        .or('folderId')
        .equals(null as unknown as string)
        .and(note => !note.isTrashed)
        .sortBy('updatedAt')
        .then(notes => notes.reverse())
    }
    return db.notes
      .where('folderId')
      .equals(folderId)
      .and(note => !note.isTrashed)
      .sortBy('updatedAt')
      .then(notes => notes.reverse())
  }

  async create(ownerId: string, input: NoteCreateInput): Promise<Note> {
    const id = generateId()
    const now = Date.now()

    const note: Note = {
      id,
      PK: createNotePK(ownerId),
      SK: createNoteSK(id),
      ownerId,
      folderId: input.folderId ?? null,
      title: input.title,
      content: input.content ?? '',
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      createdAt: now,
      updatedAt: now
    }

    await db.notes.add(note)
    return note
  }

  async update(id: string, input: NoteUpdateInput): Promise<Note> {
    const now = Date.now()
    await db.notes.update(id, {
      ...input,
      updatedAt: now
    })
    const note = await db.notes.get(id)
    if (!note) {
      throw new Error(`Note with id ${id} not found`)
    }
    return note
  }

  async delete(id: string): Promise<void> {
    await db.notes.delete(id)
  }

  async search(ownerId: string, query: string): Promise<Note[]> {
    const lowerQuery = query.toLowerCase()
    return db.notes
      .where('ownerId')
      .equals(ownerId)
      .and(note => !note.isTrashed)
      .filter(note =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
      )
      .sortBy('updatedAt')
      .then(notes => notes.reverse())
  }
}

export const noteRepository = new DexieNoteRepository()
