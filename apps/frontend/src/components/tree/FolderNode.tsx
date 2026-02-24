import { useState, type DragEvent } from 'react'
import { ChevronRight, Folder as FolderIcon } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/utils'
import { NoteNode } from './NoteNode'
import type { Folder, Note } from '@/core/entities'

interface FolderNodeProps {
  folder: Folder
  childFolders: Folder[]
  notes: Note[]
  getChildFolders: (parentId: string) => Folder[]
  getNotesByFolder: (folderId: string) => Note[]
  level: number
  draggedNoteId: string | null
  onNoteDragStart: (e: DragEvent, noteId: string) => void
  onNoteDragEnd: () => void
  onNoteDrop: (noteId: string, folderId: string | null) => void
}

export function FolderNode({
  folder,
  childFolders,
  notes,
  getChildFolders,
  getNotesByFolder,
  level,
  draggedNoteId,
  onNoteDragStart,
  onNoteDragEnd,
  onNoteDrop
}: FolderNodeProps) {
  const { selectedFolderId, selectFolder, toggleFolderExpanded, openContextMenu } = useStore()
  const [isDragOver, setIsDragOver] = useState(false)

  const isSelected = selectedFolderId === folder.id
  const hasChildren = childFolders.length > 0 || notes.length > 0

  const handleClick = () => {
    selectFolder(folder.id)
    if (hasChildren) {
      toggleFolderExpanded(folder.id)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    openContextMenu(e.clientX, e.clientY, folder.id, 'folder')
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedNoteId) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (draggedNoteId) {
      onNoteDrop(draggedNoteId, folder.id)
    }
  }

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'tree-node group',
          isSelected && 'active',
          isDragOver && 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <ChevronRight
          className={cn(
            'h-4 w-4 shrink-0 text-neutral-400 transition-transform',
            folder.isExpanded && 'rotate-90',
            !hasChildren && 'invisible'
          )}
        />
        <FolderIcon className="h-4 w-4 shrink-0 text-neutral-500" />
        <span className="truncate text-sm">{folder.name}</span>
      </div>

      {/* Children */}
      {folder.isExpanded && hasChildren && (
        <div>
          {/* Child folders */}
          {childFolders.map(childFolder => (
            <FolderNode
              key={childFolder.id}
              folder={childFolder}
              childFolders={getChildFolders(childFolder.id)}
              notes={getNotesByFolder(childFolder.id)}
              getChildFolders={getChildFolders}
              getNotesByFolder={getNotesByFolder}
              level={level + 1}
              draggedNoteId={draggedNoteId}
              onNoteDragStart={onNoteDragStart}
              onNoteDragEnd={onNoteDragEnd}
              onNoteDrop={onNoteDrop}
            />
          ))}

          {/* Notes in this folder */}
          {notes.map(note => (
            <NoteNode
              key={note.id}
              note={note}
              level={level + 1}
              isDragging={draggedNoteId === note.id}
              onDragStart={onNoteDragStart}
              onDragEnd={onNoteDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  )
}
