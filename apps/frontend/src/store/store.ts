import { create } from 'zustand'
import {
  type NotesSlice,
  createNotesSlice,
  type FoldersSlice,
  createFoldersSlice,
  type ProjectsSlice,
  createProjectsSlice,
  type TasksSlice,
  createTasksSlice,
  type EditorSlice,
  createEditorSlice,
  type UISlice,
  createUISlice,
  type ThemeSlice,
  createThemeSlice
} from './slices'

export type AppStore = NotesSlice & FoldersSlice & ProjectsSlice & TasksSlice & EditorSlice & UISlice & ThemeSlice

export const useStore = create<AppStore>()((...args) => ({
  ...createNotesSlice(...args),
  ...createFoldersSlice(...args),
  ...createProjectsSlice(...args),
  ...createTasksSlice(...args),
  ...createEditorSlice(...args),
  ...createUISlice(...args),
  ...createThemeSlice(...args)
}))
