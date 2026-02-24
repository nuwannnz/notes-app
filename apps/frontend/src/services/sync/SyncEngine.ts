import { db } from '@/infrastructure/database/dexie/db'
import { syncQueue } from './SyncQueue'
import { conflictResolver } from './ConflictResolver'
import { notesApi } from '@/infrastructure/api/notes.api'
import { foldersApi } from '@/infrastructure/api/folders.api'
import { projectsApi } from '@/infrastructure/api/projects.api'
import { tasksApi } from '@/infrastructure/api/tasks.api'
import { ApiError } from '@/infrastructure/api/client'
import type { SyncQueueItem } from '@/infrastructure/database/dexie/db'

export class SyncEngine {
  private isFlushing = false
  private onlineHandler: (() => void) | null = null

  start() {
    this.onlineHandler = () => this.flush()
    window.addEventListener('online', this.onlineHandler)
  }

  stop() {
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler)
      this.onlineHandler = null
    }
  }

  /**
   * Enqueue a write operation. Always writes to Dexie first (optimistic),
   * then attempts the API call if online.
   */
  async write(item: Omit<SyncQueueItem, 'localSeq' | 'status' | 'retryCount' | 'createdAt'>) {
    await syncQueue.enqueue(item)

    if (navigator.onLine) {
      // Fire-and-forget flush — don't block the caller
      this.flush().catch(console.error)
    }
  }

  /** Pull all entities from API into Dexie after sign-in */
  async pullAll(ownerId: string) {
    if (!navigator.onLine) return

    try {
      const [notes, folders, projects] = await Promise.all([
        notesApi.list(),
        foldersApi.list(),
        projectsApi.list(),
      ])

      // Conflict resolution: merge with existing local data
      const localNotes = await db.notes.where('ownerId').equals(ownerId).toArray()
      const localFolders = await db.folders.where('ownerId').equals(ownerId).toArray()
      const localProjects = await db.projects.where('ownerId').equals(ownerId).toArray()

      const mergedNotes = conflictResolver.resolveAll(localNotes, notes)
      const mergedFolders = conflictResolver.resolveAll(localFolders, folders)
      const mergedProjects = conflictResolver.resolveAll(localProjects, projects)

      await db.transaction('rw', [db.notes, db.folders, db.projects], async () => {
        await db.notes.bulkPut(mergedNotes)
        await db.folders.bulkPut(mergedFolders)
        await db.projects.bulkPut(mergedProjects)
      })
    } catch (err) {
      console.error('[SyncEngine] pullAll failed:', err)
    }
  }

  /** Process all pending sync queue items in order */
  async flush() {
    if (this.isFlushing || !navigator.onLine) return
    this.isFlushing = true

    try {
      const items = await syncQueue.getPending()

      for (const item of items) {
        if (item.localSeq === undefined) continue
        await syncQueue.markSyncing(item.localSeq)

        try {
          await this.executeItem(item)
          await syncQueue.markDone(item.localSeq)
        } catch (err) {
          const retryCount = item.retryCount + 1
          await syncQueue.markFailed(item.localSeq, retryCount)

          if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
            // Client error — don't retry
            console.warn(`[SyncEngine] Client error for ${item.entityType}/${item.entityId}:`, err.message)
          }
        }
      }
    } finally {
      this.isFlushing = false
    }
  }

  private async executeItem(item: SyncQueueItem) {
    const { entityType, entityId, operation, payload } = item

    switch (entityType) {
      case 'note':
        if (operation === 'create') await notesApi.create(payload as unknown as Parameters<typeof notesApi.create>[0])
        else if (operation === 'update') await notesApi.update(entityId, payload as unknown as Parameters<typeof notesApi.update>[1])
        else if (operation === 'delete') await notesApi.delete(entityId)
        break

      case 'folder':
        if (operation === 'create') await foldersApi.create(payload as unknown as Parameters<typeof foldersApi.create>[0])
        else if (operation === 'update') await foldersApi.update(entityId, payload as unknown as Parameters<typeof foldersApi.update>[1])
        else if (operation === 'delete') await foldersApi.delete(entityId)
        break

      case 'project':
        if (operation === 'create') await projectsApi.create(payload as unknown as Parameters<typeof projectsApi.create>[0])
        else if (operation === 'update') await projectsApi.update(entityId, payload as unknown as Parameters<typeof projectsApi.update>[1])
        else if (operation === 'delete') await projectsApi.delete(entityId)
        break

      case 'task': {
        const projectId = (payload as { projectId?: string })?.projectId ?? ''
        if (operation === 'create') await tasksApi.create(projectId, payload as unknown as Parameters<typeof tasksApi.create>[1])
        else if (operation === 'update') await tasksApi.update(projectId, entityId, payload as unknown as Parameters<typeof tasksApi.update>[2])
        else if (operation === 'delete') await tasksApi.delete(projectId, entityId)
        break
      }
    }
  }
}

export const syncEngine = new SyncEngine()
