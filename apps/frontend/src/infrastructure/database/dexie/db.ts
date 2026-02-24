import Dexie, { type EntityTable } from 'dexie'
import type { Note, Block, Folder, Project, Task } from '@/core/entities'

export interface SyncQueueItem {
  localSeq?: number  // auto-increment primary key
  entityType: 'note' | 'folder' | 'project' | 'task'
  entityId: string
  operation: 'create' | 'update' | 'delete'
  payload?: Record<string, unknown>
  status: 'pending' | 'syncing' | 'failed'
  retryCount: number
  createdAt: number
}

export class NotesDatabase extends Dexie {
  notes!: EntityTable<Note, 'id'>
  blocks!: EntityTable<Block, 'id'>
  folders!: EntityTable<Folder, 'id'>
  projects!: EntityTable<Project, 'id'>
  tasks!: EntityTable<Task, 'id'>
  syncQueue!: EntityTable<SyncQueueItem, 'localSeq'>

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

    // v4: add blocks table and sync_queue
    this.version(4).stores({
      notes: 'id, PK, SK, ownerId, folderId, title, createdAt, updatedAt, isPinned, isArchived, isTrashed',
      blocks: 'id, PK, SK, noteId, position, createdAt, updatedAt',
      folders: 'id, PK, SK, ownerId, parentId, name, position, createdAt, updatedAt',
      projects: 'id, PK, SK, ownerId, name, color, createdAt, updatedAt',
      tasks: 'id, PK, SK, projectId, title, isCompleted, position, createdAt, updatedAt',
      syncQueue: '++localSeq, entityType, entityId, operation, status'
    })
  }
}

export const db = new NotesDatabase()
