import type { BaseEntity, DynamoDBKeys } from './base'

export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'codeBlock'
  | 'blockquote'
  | 'divider'
  | 'image'

export interface Block extends BaseEntity, DynamoDBKeys {
  noteId: string
  type: BlockType
  content: string
  position: number
  metadata?: Record<string, unknown>
}

export type BlockCreateInput = Pick<Block, 'type' | 'content'> & {
  noteId: string
  position?: number
  metadata?: Record<string, unknown>
}

export type BlockUpdateInput = Partial<Pick<Block, 'type' | 'content' | 'position' | 'metadata'>>

export function createBlockPK(noteId: string): string {
  return `NOTE#${noteId}`
}

export function createBlockSK(position: number, blockId: string): string {
  return `BLOCK#${position.toString().padStart(6, '0')}#${blockId}`
}
