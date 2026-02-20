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
}

export function FolderNode({
  folder,
  childFolders,
  notes,
  getChildFolders,
  getNotesByFolder,
  level
}: FolderNodeProps) {
  const { selectedFolderId, selectFolder, toggleFolderExpanded, openContextMenu } = useStore()

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

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          'tree-node group',
          isSelected && 'active'
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
            />
          ))}

          {/* Notes in this folder */}
          {notes.map(note => (
            <NoteNode key={note.id} note={note} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
