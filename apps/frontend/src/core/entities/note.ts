import type { BaseEntity, DynamoDBKeys } from './base'
import type { Block } from './block'

export interface Note extends BaseEntity, DynamoDBKeys {
  ownerId: string
  folderId: string | null
  title: string
  content: string // JSON string of editor content (TipTap)
  isPinned: boolean
  isArchived: boolean
  isTrashed: boolean
}

export interface NoteWithBlocks extends Note {
  blocks: Block[]
}

export type NoteCreateInput = Pick<Note, 'title'> & {
  folderId?: string | null
  content?: string
}

export type NoteUpdateInput = Partial<Pick<Note, 'title' | 'content' | 'folderId' | 'isPinned' | 'isArchived' | 'isTrashed'>>

export function createNotePK(ownerId: string): string {
  return `USER#${ownerId}`
}

export function createNoteSK(noteId: string): string {
  return `NOTE#${noteId}`
}
