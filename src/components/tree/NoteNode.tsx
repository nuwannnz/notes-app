import { FileText, Pin } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/utils'
import type { Note } from '@/core/entities'

interface NoteNodeProps {
  note: Note
  level?: number
}

export function NoteNode({ note, level = 0 }: NoteNodeProps) {
  const { selectedNoteId, selectNote, openContextMenu } = useStore()

  const isSelected = selectedNoteId === note.id

  const handleClick = () => {
    selectNote(note.id)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    openContextMenu(e.clientX, e.clientY, note.id, 'note')
  }

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={cn(
        'tree-node group',
        isSelected && 'active'
      )}
      style={{ paddingLeft: `${level * 12 + 8 + 20}px` }} // Extra 20px to align with folder content
    >
      <FileText className="h-4 w-4 shrink-0 text-neutral-400" />
      <span className="truncate text-sm flex-1">{note.title || 'Untitled'}</span>
      {note.isPinned && (
        <Pin className="h-3 w-3 shrink-0 text-primary-500" />
      )}
    </div>
  )
}
