import { Edit2, Trash2, Pin, FolderInput, Copy } from 'lucide-react'
import { useStore } from '@/store'
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from '@/components/ui'

export function AppContextMenu() {
  const {
    contextMenu,
    closeContextMenu,
    deleteNote,
    updateNote,
    openModal,
    notes
  } = useStore()

  const handleRename = () => {
    if (contextMenu.targetType === 'folder') {
      openModal('renameFolder', { folderId: contextMenu.targetId })
    }
    closeContextMenu()
  }

  const handleDelete = async () => {
    if (contextMenu.targetId) {
      if (contextMenu.targetType === 'note') {
        await deleteNote(contextMenu.targetId)
      } else if (contextMenu.targetType === 'folder') {
        openModal('deleteConfirm', {
          type: 'folder',
          id: contextMenu.targetId
        })
      }
    }
    closeContextMenu()
  }

  const handlePin = async () => {
    if (contextMenu.targetId && contextMenu.targetType === 'note') {
      const note = notes.find(n => n.id === contextMenu.targetId)
      if (note) {
        await updateNote(contextMenu.targetId, { isPinned: !note.isPinned })
      }
    }
    closeContextMenu()
  }

  const handleDuplicate = async () => {
    // TODO: Implement duplicate functionality
    closeContextMenu()
  }

  const handleMoveToFolder = () => {
    // TODO: Implement move to folder functionality
    closeContextMenu()
  }

  const note = contextMenu.targetType === 'note'
    ? notes.find(n => n.id === contextMenu.targetId)
    : null

  return (
    <ContextMenu
      isOpen={contextMenu.isOpen}
      x={contextMenu.x}
      y={contextMenu.y}
      onClose={closeContextMenu}
    >
      {contextMenu.targetType === 'note' && (
        <>
          <ContextMenuItem
            onClick={handlePin}
            icon={<Pin className="h-4 w-4" />}
          >
            {note?.isPinned ? 'Unpin' : 'Pin to top'}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleDuplicate}
            icon={<Copy className="h-4 w-4" />}
          >
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleMoveToFolder}
            icon={<FolderInput className="h-4 w-4" />}
          >
            Move to folder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={handleDelete}
            icon={<Trash2 className="h-4 w-4" />}
            variant="danger"
          >
            Delete
          </ContextMenuItem>
        </>
      )}

      {contextMenu.targetType === 'folder' && (
        <>
          <ContextMenuItem
            onClick={handleRename}
            icon={<Edit2 className="h-4 w-4" />}
          >
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={handleDelete}
            icon={<Trash2 className="h-4 w-4" />}
            variant="danger"
          >
            Delete
          </ContextMenuItem>
        </>
      )}
    </ContextMenu>
  )
}
