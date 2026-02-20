import type { Block, BlockType } from '@/core/entities'
import { generateId } from './id'

interface TiptapNode {
  type: string
  content?: TiptapNode[]
  text?: string
  attrs?: Record<string, unknown>
}

interface TiptapDoc {
  type: 'doc'
  content?: TiptapNode[]
}

function mapTiptapTypeToBlockType(type: string, attrs?: Record<string, unknown>): BlockType {
  switch (type) {
    case 'heading':
      const level = attrs?.level as number
      if (level === 1) return 'heading1'
      if (level === 2) return 'heading2'
      return 'heading3'
    case 'bulletList':
      return 'bulletList'
    case 'orderedList':
      return 'orderedList'
    case 'taskList':
      return 'taskList'
    case 'codeBlock':
      return 'codeBlock'
    case 'blockquote':
      return 'blockquote'
    case 'horizontalRule':
      return 'divider'
    case 'image':
      return 'image'
    default:
      return 'paragraph'
  }
}

function extractTextContent(node: TiptapNode): string {
  if (node.text) {
    return node.text
  }
  if (node.content) {
    return node.content.map(extractTextContent).join('')
  }
  return ''
}

function nodeToText(node: TiptapNode): string {
  if (node.type === 'bulletList' || node.type === 'orderedList' || node.type === 'taskList') {
    // For lists, extract text from list items
    return node.content?.map(item => extractTextContent(item)).join('\n') ?? ''
  }
  return extractTextContent(node)
}

export function parseContentToBlocks(noteId: string, content: string): Block[] {
  if (!content) return []

  try {
    const doc: TiptapDoc = JSON.parse(content)
    if (!doc.content) return []

    const now = Date.now()

    return doc.content.map((node, index) => {
      const id = generateId()
      const blockType = mapTiptapTypeToBlockType(node.type, node.attrs)
      const textContent = nodeToText(node)

      return {
        id,
        PK: `NOTE#${noteId}`,
        SK: `BLOCK#${index.toString().padStart(6, '0')}#${id}`,
        noteId,
        type: blockType,
        content: textContent,
        position: index,
        metadata: node.attrs,
        createdAt: now,
        updatedAt: now
      } as Block
    })
  } catch {
    return []
  }
}
