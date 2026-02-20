import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { Modal, Button, Input } from '@/components/ui'

const OWNER_ID = 'local'

export function AppModals() {
  const { modal, closeModal, createFolder, updateFolder, deleteFolder, folders } = useStore()

  const [folderName, setFolderName] = useState('')

  useEffect(() => {
    if (modal.type === 'renameFolder' && modal.data?.folderId) {
      const folder = folders.find(f => f.id === modal.data?.folderId)
      if (folder) {
        setFolderName(folder.name)
      }
    } else if (modal.type === 'createFolder') {
      setFolderName('')
    }
  }, [modal, folders])

  const handleCreateFolder = async () => {
    if (folderName.trim()) {
      await createFolder(OWNER_ID, { name: folderName.trim() })
      setFolderName('')
      closeModal()
    }
  }

  const handleRenameFolder = async () => {
    if (folderName.trim() && modal.data?.folderId) {
      await updateFolder(modal.data.folderId as string, { name: folderName.trim() })
      setFolderName('')
      closeModal()
    }
  }

  const handleDeleteConfirm = async () => {
    if (modal.data?.type === 'folder' && modal.data?.id) {
      await deleteFolder(modal.data.id as string)
      closeModal()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (modal.type === 'createFolder') {
        handleCreateFolder()
      } else if (modal.type === 'renameFolder') {
        handleRenameFolder()
      }
    }
  }

  return (
    <>
      {/* Create Folder Modal */}
      <Modal
        isOpen={modal.isOpen && modal.type === 'createFolder'}
        onClose={closeModal}
        title="Create Folder"
      >
        <div className="space-y-4">
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!folderName.trim()}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rename Folder Modal */}
      <Modal
        isOpen={modal.isOpen && modal.type === 'renameFolder'}
        onClose={closeModal}
        title="Rename Folder"
      >
        <div className="space-y-4">
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleRenameFolder} disabled={!folderName.trim()}>
              Rename
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modal.isOpen && modal.type === 'deleteConfirm'}
        onClose={closeModal}
        title="Delete Confirmation"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this {String(modal.data?.type ?? 'item')}? This action cannot be undone.
            {modal.data?.type === 'folder' && (
              <span className="block mt-2 text-sm text-red-500">
                All notes inside this folder will also be deleted.
              </span>
            )}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
