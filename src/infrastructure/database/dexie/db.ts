import Dexie, { type EntityTable } from 'dexie'
import type { Note, Folder, Project, Task } from '@/core/entities'

export class NotesDatabase extends Dexie {
  notes!: EntityTable<Note, 'id'>
  folders!: EntityTable<Folder, 'id'>
  projects!: EntityTable<Project, 'id'>
  tasks!: EntityTable<Task, 'id'>

  constructor() {
    super('NotesAppDB')

    this.version(1).stores({
      notes: 'id, PK, SK, ownerId, folderId, title, createdAt, updatedAt, isPinned, isArchived, isTrashed',
      folders: 'id, PK, SK, ownerId, parentId, name, position, createdAt, updatedAt'
    })

    this.version(2).stores({
      notes: 'id, PK, SK, ownerId, folderId, title, createdAt, updatedAt, isPinned, isArchived, isTrashed',
      folders: 'id, PK, SK, ownerId, parentId, name, position, createdAt, updatedAt',
      projects: 'id, PK, SK, ownerId, name, createdAt, updatedAt',
      tasks: 'id, PK, SK, projectId, title, isCompleted, position, createdAt, updatedAt'
    })

    this.version(3).stores({
      notes: 'id, PK, SK, ownerId, folderId, title, createdAt, updatedAt, isPinned, isArchived, isTrashed',
      folders: 'id, PK, SK, ownerId, parentId, name, position, createdAt, updatedAt',
      projects: 'id, PK, SK, ownerId, name, color, createdAt, updatedAt',
      tasks: 'id, PK, SK, projectId, title, isCompleted, position, createdAt, updatedAt'
    }).upgrade(tx => {
      return tx.table('projects').toCollection().modify(project => {
        if (!project.color) project.color = 'blue'
      })
    })
  }
}

export const db = new NotesDatabase()
