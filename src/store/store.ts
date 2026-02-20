import { create } from 'zustand'
import {
  type NotesSlice,
  createNotesSlice,
  type FoldersSlice,
  createFoldersSlice,
  type EditorSlice,
  createEditorSlice,
  type UISlice,
  createUISlice,
  type ThemeSlice,
  createThemeSlice
} from './slices'

export type AppStore = NotesSlice & FoldersSlice & EditorSlice & UISlice & ThemeSlice

export const useStore = create<AppStore>()((...args) => ({
  ...createNotesSlice(...args),
  ...createFoldersSlice(...args),
  ...createEditorSlice(...args),
  ...createUISlice(...args),
  ...createThemeSlice(...args)
}))
