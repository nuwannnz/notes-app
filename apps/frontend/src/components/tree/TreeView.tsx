import { useMemo, useState, type DragEvent } from 'react'
import { useStore, useFolderTree, usePinnedNotes } from '@/store'
import { FolderNode } from './FolderNode'
import { NoteNode } from './NoteNode'
import { cn } from '@/utils'
import type { Folder, Note } from '@/core/entities'

export function TreeView() {
  const { notes, folders, searchQuery, moveNoteToFolder } = useStore()
  const folderTree = useFolderTree()
  const pinnedNotes = usePinnedNotes()

  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  const [isRootDragOver, setIsRootDragOver] = useState(false)

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const query = searchQuery.toLowerCase()
    return notes.filter(
      note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    )
  }, [notes, searchQuery])

  // Get root level items
  const rootFolders = folderTree.get(null) ?? []
  const rootNotes = filteredNotes.filter(note => note.folderId === null)

  // Get notes by folder
  const getNotesByFolder = (folderId: string): Note[] => {
    return filteredNotes.filter(note => note.folderId === folderId)
  }

  // Get child folders
  const getChildFolders = (parentId: string): Folder[] => {
    return folderTree.get(parentId) ?? []
  }

  // Drag handlers
  const handleNoteDragStart = (e: DragEvent, noteId: string) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', noteId)
    setDraggedNoteId(noteId)
  }

  const handleNoteDragEnd = () => {
    setDraggedNoteId(null)
    setIsRootDragOver(false)
  }

  const handleNoteDrop = async (noteId: string, folderId: string | null) => {
    await moveNoteToFolder(noteId, folderId)
    setDraggedNoteId(null)
    setIsRootDragOver(false)
  }

  // Root drop zone handlers (for moving notes out of folders)
  const handleRootDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (draggedNoteId) {
      setIsRootDragOver(true)
    }
  }

  const handleRootDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Only set to false if leaving the root container entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const { clientX, clientY } = e
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setIsRootDragOver(false)
    }
  }

  const handleRootDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (draggedNoteId) {
      handleNoteDrop(draggedNoteId, null)
    }
  }

  // If searching, show flat list
  if (searchQuery.trim()) {
    return (
      <div className="space-y-1 py-2">
        {filteredNotes.length === 0 ? (
          <div className="text-sm text-neutral-400 dark:text-neutral-500 px-2 py-4 text-center">
            No notes found
          </div>
        ) : (
          filteredNotes.map(note => (
            <NoteNode key={note.id} note={note} />
          ))
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'space-y-1 py-2 min-h-[200px]',
        isRootDragOver && 'bg-primary-50 dark:bg-primary-900/20'
      )}
      onDragOver={handleRootDragOver}
      onDragLeave={handleRootDragLeave}
      onDrop={handleRootDrop}
    >
      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-neutral-400 dark:text-neutral-500 px-2 mb-1 uppercase tracking-wider">
            Pinned
          </div>
          {pinnedNotes.map(note => (
            <NoteNode
              key={note.id}
              note={note}
              isDragging={draggedNoteId === note.id}
              onDragStart={handleNoteDragStart}
              onDragEnd={handleNoteDragEnd}
            />
          ))}
        </div>
      )}

      {/* Folders and Notes */}
      {rootFolders.map(folder => (
        <FolderNode
          key={folder.id}
          folder={folder}
          childFolders={getChildFolders(folder.id)}
          notes={getNotesByFolder(folder.id)}
          getChildFolders={getChildFolders}
          getNotesByFolder={getNotesByFolder}
          level={0}
          draggedNoteId={draggedNoteId}
          onNoteDragStart={handleNoteDragStart}
          onNoteDragEnd={handleNoteDragEnd}
          onNoteDrop={handleNoteDrop}
        />
      ))}

      {/* Root level notes (not pinned, not in folders) */}
      {rootNotes
        .filter(note => !note.isPinned)
        .map(note => (
          <NoteNode
            key={note.id}
            note={note}
            isDragging={draggedNoteId === note.id}
            onDragStart={handleNoteDragStart}
            onDragEnd={handleNoteDragEnd}
          />
        ))}

      {/* Empty state */}
      {folders.length === 0 && notes.length === 0 && (
        <div className="text-sm text-neutral-400 dark:text-neutral-500 px-2 py-4 text-center">
          No notes yet. Create one to get started!
        </div>
      )}

      {/* Drop indicator for root level */}
      {draggedNoteId && isRootDragOver && (
        <div className="mx-2 h-1 bg-primary-500 rounded-full" />
      )}
    </div>
  )
}
