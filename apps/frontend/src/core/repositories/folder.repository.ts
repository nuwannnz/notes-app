import type { Folder, FolderCreateInput, FolderUpdateInput } from '../entities'

export interface IFolderRepository {
  getAll(ownerId: string): Promise<Folder[]>
  getById(id: string): Promise<Folder | undefined>
  getByParent(parentId: string | null): Promise<Folder[]>
  create(ownerId: string, input: FolderCreateInput): Promise<Folder>
  update(id: string, input: FolderUpdateInput): Promise<Folder>
  delete(id: string): Promise<void>
}
