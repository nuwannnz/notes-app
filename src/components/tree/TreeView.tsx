import { useMemo } from 'react'
import { useStore, useFolderTree, usePinnedNotes } from '@/store'
import { FolderNode } from './FolderNode'
import { NoteNode } from './NoteNode'
import type { Folder, Note } from '@/core/entities'

export function TreeView() {
  const { notes, folders, searchQuery } = useStore()
  const folderTree = useFolderTree()
  const pinnedNotes = usePinnedNotes()

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
    <div className="space-y-1 py-2">
      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-neutral-400 dark:text-neutral-500 px-2 mb-1 uppercase tracking-wider">
            Pinned
          </div>
          {pinnedNotes.map(note => (
            <NoteNode key={note.id} note={note} />
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
        />
      ))}

      {/* Root level notes (not pinned, not in folders) */}
      {rootNotes
        .filter(note => !note.isPinned)
        .map(note => (
          <NoteNode key={note.id} note={note} />
        ))}

      {/* Empty state */}
      {folders.length === 0 && notes.length === 0 && (
        <div className="text-sm text-neutral-400 dark:text-neutral-500 px-2 py-4 text-center">
          No notes yet. Create one to get started!
        </div>
      )}
    </div>
  )
}
