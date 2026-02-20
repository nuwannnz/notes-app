import type { IFolderRepository } from '@/core/repositories'
import type { Folder, FolderCreateInput, FolderUpdateInput } from '@/core/entities'
import { createFolderPK, createFolderSK } from '@/core/entities'
import { db } from '../dexie/db'
import { generateId } from '@/utils'

export class DexieFolderRepository implements IFolderRepository {
  async getAll(ownerId: string): Promise<Folder[]> {
    return db.folders
      .where('ownerId')
      .equals(ownerId)
      .sortBy('position')
  }

  async getById(id: string): Promise<Folder | undefined> {
    return db.folders.get(id)
  }

  async getByParent(parentId: string | null): Promise<Folder[]> {
    if (parentId === null) {
      return db.folders
        .filter(folder => folder.parentId === null || folder.parentId === '')
        .sortBy('position')
    }
    return db.folders
      .where('parentId')
      .equals(parentId)
      .sortBy('position')
  }

  async create(ownerId: string, input: FolderCreateInput): Promise<Folder> {
    const id = generateId()
    const now = Date.now()

    // Get max position for siblings
    const siblings = await this.getByParent(input.parentId ?? null)
    const maxPosition = siblings.length > 0
      ? Math.max(...siblings.map(f => f.position))
      : -1

    const folder: Folder = {
      id,
      PK: createFolderPK(ownerId),
      SK: createFolderSK(id),
      ownerId,
      parentId: input.parentId ?? null,
      name: input.name,
      icon: input.icon,
      color: input.color,
      isExpanded: true,
      position: maxPosition + 1,
      createdAt: now,
      updatedAt: now
    }

    await db.folders.add(folder)
    return folder
  }

  async update(id: string, input: FolderUpdateInput): Promise<Folder> {
    const now = Date.now()
    await db.folders.update(id, {
      ...input,
      updatedAt: now
    })
    const folder = await db.folders.get(id)
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`)
    }
    return folder
  }

  async delete(id: string): Promise<void> {
    // Delete all notes in this folder
    const notes = await db.notes.where('folderId').equals(id).toArray()
    await Promise.all(notes.map(note => db.notes.delete(note.id)))

    // Delete all child folders recursively
    const children = await db.folders.where('parentId').equals(id).toArray()
    await Promise.all(children.map(child => this.delete(child.id)))

    // Delete the folder itself
    await db.folders.delete(id)
  }
}

export const folderRepository = new DexieFolderRepository()
