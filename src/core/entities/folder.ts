import type { BaseEntity, DynamoDBKeys } from './base'

export interface Folder extends BaseEntity, DynamoDBKeys {
  ownerId: string
  parentId: string | null
  name: string
  icon?: string
  color?: string
  isExpanded: boolean
  position: number
}

export type FolderCreateInput = Pick<Folder, 'name'> & {
  parentId?: string | null
  icon?: string
  color?: string
}

export type FolderUpdateInput = Partial<Pick<Folder, 'name' | 'parentId' | 'icon' | 'color' | 'isExpanded' | 'position'>>

export function createFolderPK(ownerId: string): string {
  return `USER#${ownerId}`
}

export function createFolderSK(folderId: string): string {
  return `FOLDER#${folderId}`
}
