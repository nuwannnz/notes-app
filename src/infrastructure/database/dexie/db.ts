import Dexie, { type EntityTable } from 'dexie'
import type { Note, Folder } from '@/core/entities'

export class NotesDatabase extends Dexie {
  notes!: EntityTable<Note, 'id'>
  folders!: EntityTable<Folder, 'id'>

  constructor() {
    super('NotesAppDB')

    this.version(1).stores({
      notes: 'id, PK, SK, ownerId, folderId, title, createdAt, updatedAt, isPinned, isArchived, isTrashed',
      folders: 'id, PK, SK, ownerId, parentId, name, position, createdAt, updatedAt'
    })
  }
}

export const db = new NotesDatabase()
