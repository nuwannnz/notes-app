import type { StateCreator } from 'zustand'
import type { Editor } from '@tiptap/react'

export interface EditorSlice {
  editor: Editor | null
  isEditorReady: boolean
  isSaving: boolean
  lastSavedAt: number | null
  hasUnsavedChanges: boolean

  // Actions
  setEditor: (editor: Editor | null) => void
  setEditorReady: (ready: boolean) => void
  setSaving: (saving: boolean) => void
  setLastSavedAt: (timestamp: number | null) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
}

export const createEditorSlice: StateCreator<EditorSlice, [], [], EditorSlice> = (set) => ({
  editor: null,
  isEditorReady: false,
  isSaving: false,
  lastSavedAt: null,
  hasUnsavedChanges: false,

  setEditor: (editor: Editor | null) => {
    set({ editor, isEditorReady: editor !== null })
  },

  setEditorReady: (ready: boolean) => {
    set({ isEditorReady: ready })
  },

  setSaving: (saving: boolean) => {
    set({ isSaving: saving })
  },

  setLastSavedAt: (timestamp: number | null) => {
    set({ lastSavedAt: timestamp, hasUnsavedChanges: false })
  },

  setHasUnsavedChanges: (hasChanges: boolean) => {
    set({ hasUnsavedChanges: hasChanges })
  }
})
