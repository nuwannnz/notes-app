import { useStore } from '../store'
import type { Note, Folder, Project, Task } from '@/core/entities'

// Note selectors
export const useSelectedNote = (): Note | undefined => {
  return useStore(state => {
    if (!state.selectedNoteId) return undefined
    return state.notes.find(note => note.id === state.selectedNoteId)
  })
}

export const useNotesByFolder = (folderId: string | null): Note[] => {
  return useStore(state =>
    state.notes.filter(note => note.folderId === folderId)
  )
}

export const usePinnedNotes = (): Note[] => {
  return useStore(state =>
    state.notes.filter(note => note.isPinned)
  )
}

// Folder selectors
export const useSelectedFolder = (): Folder | undefined => {
  return useStore(state => {
    if (!state.selectedFolderId) return undefined
    return state.folders.find(folder => folder.id === state.selectedFolderId)
  })
}

export const useRootFolders = (): Folder[] => {
  return useStore(state =>
    state.folders.filter(folder => folder.parentId === null)
  )
}

export const useChildFolders = (parentId: string): Folder[] => {
  return useStore(state =>
    state.folders.filter(folder => folder.parentId === parentId)
  )
}

export const useFolderTree = (): Map<string | null, Folder[]> => {
  return useStore(state => {
    const tree = new Map<string | null, Folder[]>()
    state.folders.forEach(folder => {
      const parentId = folder.parentId
      if (!tree.has(parentId)) {
        tree.set(parentId, [])
      }
      tree.get(parentId)!.push(folder)
    })
    // Sort each level by position
    tree.forEach((folders, key) => {
      tree.set(key, folders.sort((a, b) => a.position - b.position))
    })
    return tree
  })
}

// UI selectors
export const useIsLoading = (): boolean => {
  return useStore(state => state.isLoadingNotes || state.isLoadingFolders)
}

export const useHasError = (): string | null => {
  return useStore(state => state.notesError || state.foldersError)
}

// Project selectors
export const useSelectedProject = (): Project | undefined => {
  return useStore(state => {
    if (!state.selectedProjectId) return undefined
    return state.projects.find(project => project.id === state.selectedProjectId)
  })
}

export const useProjectTasks = (): Task[] => {
  return useStore(state => state.tasks)
}

export const useProjectProgress = (): { completed: number; total: number; percentage: number } => {
  return useStore(state => {
    const total = state.tasks.length
    const completed = state.tasks.filter(t => t.isCompleted).length
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { completed, total, percentage }
  })
}

export const useProjectProgressById = (projectId: string): { completed: number; total: number; percentage: number } => {
  return useStore(state => {
    const tasks = state.tasks.filter(t => t.projectId === projectId)
    const total = tasks.length
    const completed = tasks.filter(t => t.isCompleted).length
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { completed, total, percentage }
  })
}
