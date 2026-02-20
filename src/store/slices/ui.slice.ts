import type { StateCreator } from 'zustand'

export interface ContextMenuState {
  isOpen: boolean
  x: number
  y: number
  targetId: string | null
  targetType: 'note' | 'folder' | null
}

export interface ModalState {
  isOpen: boolean
  type: 'createFolder' | 'renameFolder' | 'deleteConfirm' | 'settings' | null
  data?: Record<string, unknown>
}

export interface UISlice {
  sidebarWidth: number
  isSidebarCollapsed: boolean
  isSidebarResizing: boolean
  contextMenu: ContextMenuState
  modal: ModalState
  searchQuery: string
  isSearching: boolean

  // Actions
  setSidebarWidth: (width: number) => void
  toggleSidebar: () => void
  setSidebarResizing: (resizing: boolean) => void
  openContextMenu: (x: number, y: number, targetId: string, targetType: 'note' | 'folder') => void
  closeContextMenu: () => void
  openModal: (type: ModalState['type'], data?: Record<string, unknown>) => void
  closeModal: () => void
  setSearchQuery: (query: string) => void
  setIsSearching: (searching: boolean) => void
}

const DEFAULT_SIDEBAR_WIDTH = 280
const MIN_SIDEBAR_WIDTH = 200
const MAX_SIDEBAR_WIDTH = 400

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  isSidebarCollapsed: false,
  isSidebarResizing: false,
  contextMenu: {
    isOpen: false,
    x: 0,
    y: 0,
    targetId: null,
    targetType: null
  },
  modal: {
    isOpen: false,
    type: null
  },
  searchQuery: '',
  isSearching: false,

  setSidebarWidth: (width: number) => {
    const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width))
    set({ sidebarWidth: clampedWidth })
  },

  toggleSidebar: () => {
    set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed }))
  },

  setSidebarResizing: (resizing: boolean) => {
    set({ isSidebarResizing: resizing })
  },

  openContextMenu: (x: number, y: number, targetId: string, targetType: 'note' | 'folder') => {
    set({
      contextMenu: {
        isOpen: true,
        x,
        y,
        targetId,
        targetType
      }
    })
  },

  closeContextMenu: () => {
    set({
      contextMenu: {
        isOpen: false,
        x: 0,
        y: 0,
        targetId: null,
        targetType: null
      }
    })
  },

  openModal: (type: ModalState['type'], data?: Record<string, unknown>) => {
    set({
      modal: {
        isOpen: true,
        type,
        data
      }
    })
  },

  closeModal: () => {
    set({
      modal: {
        isOpen: false,
        type: null,
        data: undefined
      }
    })
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  setIsSearching: (searching: boolean) => {
    set({ isSearching: searching })
  }
})
