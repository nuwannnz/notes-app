import { ulid } from 'ulid'

export function generateId(): string {
  return ulid()
}

export function generateNoteId(): string {
  return `NOTE#${ulid()}`
}

export function generateFolderId(): string {
  return `FOLDER#${ulid()}`
}

export function generateBlockId(): string {
  return `BLOCK#${ulid()}`
}

export function extractId(compositeId: string): string {
  const parts = compositeId.split('#')
  return parts[parts.length - 1]
}
