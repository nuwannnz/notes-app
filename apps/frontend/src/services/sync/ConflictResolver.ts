import type { Note, Folder, Project, Task } from '@/core/entities'

type SyncableEntity = Note | Folder | Project | Task

/**
 * Last-write-wins conflict resolution based on updatedAt timestamp.
 * Returns the entity that should be kept.
 */
export function resolveConflict<T extends SyncableEntity>(local: T, remote: T): T {
  return local.updatedAt >= remote.updatedAt ? local : remote
}

export class ConflictResolver {
  resolve<T extends SyncableEntity>(local: T, remote: T): T {
    return resolveConflict(local, remote)
  }

  resolveAll<T extends SyncableEntity>(locals: T[], remotes: T[]): T[] {
    const remoteMap = new Map(remotes.map(r => [r.id, r]))
    const localMap = new Map(locals.map(l => [l.id, l]))
    const merged: T[] = []
    const seen = new Set<string>()

    for (const local of locals) {
      const remote = remoteMap.get(local.id)
      merged.push(remote ? this.resolve(local, remote) : local)
      seen.add(local.id)
    }

    for (const remote of remotes) {
      if (!seen.has(remote.id)) {
        const local = localMap.get(remote.id)
        merged.push(local ? this.resolve(local, remote) : remote)
      }
    }

    return merged
  }
}

export const conflictResolver = new ConflictResolver()
