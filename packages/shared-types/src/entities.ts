// Shared entity types used by both frontend and infrastructure

export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
}

export interface DynamoDBKeys {
  PK: string
  SK: string
}

export interface Note extends BaseEntity, DynamoDBKeys {
  ownerId: string
  folderId: string | null
  title: string
  content: string
  isPinned: boolean
  isArchived: boolean
  isTrashed: boolean
}

export interface Block extends BaseEntity, DynamoDBKeys {
  noteId: string
  type: string
  content: string
  position: number
  metadata?: Record<string, unknown>
}

export interface NoteWithBlocks extends Note {
  blocks: Block[]
}

export interface Folder extends BaseEntity, DynamoDBKeys {
  ownerId: string
  parentId: string | null
  name: string
  icon?: string
  color?: string
  isExpanded: boolean
  position: number
}

export interface Project extends BaseEntity, DynamoDBKeys {
  ownerId: string
  name: string
  description: string
  color: string
}

export interface Task extends BaseEntity, DynamoDBKeys {
  projectId: string
  title: string
  description: string
  isCompleted: boolean
  position: number
}

export interface SyncQueueItem {
  localSeq?: number
  entityType: 'note' | 'folder' | 'project' | 'task'
  entityId: string
  operation: 'create' | 'update' | 'delete'
  payload?: Record<string, unknown>
  status: 'pending' | 'syncing' | 'failed'
  retryCount: number
  createdAt: number
}
