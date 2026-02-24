import { db } from '@/infrastructure/database/dexie/db'
import type { SyncQueueItem } from '@/infrastructure/database/dexie/db'

export class SyncQueue {
  async enqueue(item: Omit<SyncQueueItem, 'localSeq' | 'status' | 'retryCount' | 'createdAt'>): Promise<void> {
    await db.syncQueue.add({
      ...item,
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    })
  }

  async getPending(): Promise<SyncQueueItem[]> {
    return db.syncQueue
      .where('status')
      .equals('pending')
      .sortBy('localSeq')
  }

  async markSyncing(localSeq: number): Promise<void> {
    await db.syncQueue.update(localSeq, { status: 'syncing' })
  }

  async markDone(localSeq: number): Promise<void> {
    await db.syncQueue.delete(localSeq)
  }

  async markFailed(localSeq: number, retryCount: number): Promise<void> {
    await db.syncQueue.update(localSeq, {
      status: retryCount < 3 ? 'pending' : 'failed',
      retryCount,
    })
  }

  async clearFailed(): Promise<void> {
    await db.syncQueue.where('status').equals('failed').delete()
  }
}

export const syncQueue = new SyncQueue()
