import type { StateCreator } from 'zustand'
import type { Folder, FolderCreateInput, FolderUpdateInput } from '@/core/entities'
import { folderRepository } from '@/infrastructure/database'

export interface FoldersSlice {
  folders: Folder[]
  selectedFolderId: string | null
  isLoadingFolders: boolean
  foldersError: string | null

  // Actions
  loadFolders: (ownerId: string) => Promise<void>
  selectFolder: (folderId: string | null) => void
  createFolder: (ownerId: string, input: FolderCreateInput) => Promise<Folder>
  updateFolder: (id: string, input: FolderUpdateInput) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  toggleFolderExpanded: (id: string) => Promise<void>
  moveFolderToParent: (folderId: string, parentId: string | null) => Promise<void>
}

export const createFoldersSlice: StateCreator<FoldersSlice, [], [], FoldersSlice> = (set, get) => ({
  folders: [],
  selectedFolderId: null,
  isLoadingFolders: false,
  foldersError: null,

  loadFolders: async (ownerId: string) => {
    set({ isLoadingFolders: true, foldersError: null })
    try {
      const folders = await folderRepository.getAll(ownerId)
      set({ folders, isLoadingFolders: false })
    } catch (error) {
      set({
        isLoadingFolders: false,
        foldersError: error instanceof Error ? error.message : 'Failed to load folders'
      })
    }
  },

  selectFolder: (folderId: string | null) => {
    set({ selectedFolderId: folderId })
  },

  createFolder: async (ownerId: string, input: FolderCreateInput) => {
    const folder = await folderRepository.create(ownerId, input)
    set(state => ({
      folders: [...state.folders, folder]
    }))
    return folder
  },

  updateFolder: async (id: string, input: FolderUpdateInput) => {
    const updatedFolder = await folderRepository.update(id, input)
    set(state => ({
      folders: state.folders.map(folder =>
        folder.id === id ? updatedFolder : folder
      )
    }))
  },

  deleteFolder: async (id: string) => {
    await folderRepository.delete(id)
    const { selectedFolderId, folders } = get()
    set({
      folders: folders.filter(folder => folder.id !== id),
      selectedFolderId: selectedFolderId === id ? null : selectedFolderId
    })
  },

  toggleFolderExpanded: async (id: string) => {
    const folder = get().folders.find(f => f.id === id)
    if (folder) {
      await folderRepository.update(id, { isExpanded: !folder.isExpanded })
      set(state => ({
        folders: state.folders.map(f =>
          f.id === id ? { ...f, isExpanded: !f.isExpanded } : f
        )
      }))
    }
  },

  moveFolderToParent: async (folderId: string, parentId: string | null) => {
    await folderRepository.update(folderId, { parentId })
    set(state => ({
      folders: state.folders.map(folder =>
        folder.id === folderId ? { ...folder, parentId } : folder
      )
    }))
  }
})
