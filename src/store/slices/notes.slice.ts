import type { StateCreator } from 'zustand'
import type { Note, NoteCreateInput, NoteUpdateInput } from '@/core/entities'
import { noteRepository } from '@/infrastructure/database'

export interface NotesSlice {
  notes: Note[]
  selectedNoteId: string | null
  isLoadingNotes: boolean
  notesError: string | null

  // Actions
  loadNotes: (ownerId: string) => Promise<void>
  selectNote: (noteId: string | null) => void
  createNote: (ownerId: string, input: NoteCreateInput) => Promise<Note>
  updateNote: (id: string, input: NoteUpdateInput) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  moveNoteToFolder: (noteId: string, folderId: string | null) => Promise<void>
  searchNotes: (ownerId: string, query: string) => Promise<Note[]>
}

export const createNotesSlice: StateCreator<NotesSlice, [], [], NotesSlice> = (set, get) => ({
  notes: [],
  selectedNoteId: null,
  isLoadingNotes: false,
  notesError: null,

  loadNotes: async (ownerId: string) => {
    set({ isLoadingNotes: true, notesError: null })
    try {
      const notes = await noteRepository.getAll(ownerId)
      set({ notes, isLoadingNotes: false })
    } catch (error) {
      set({
        isLoadingNotes: false,
        notesError: error instanceof Error ? error.message : 'Failed to load notes'
      })
    }
  },

  selectNote: (noteId: string | null) => {
    set({ selectedNoteId: noteId })
  },

  createNote: async (ownerId: string, input: NoteCreateInput) => {
    const note = await noteRepository.create(ownerId, input)
    set(state => ({
      notes: [note, ...state.notes],
      selectedNoteId: note.id
    }))
    return note
  },

  updateNote: async (id: string, input: NoteUpdateInput) => {
    const updatedNote = await noteRepository.update(id, input)
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id ? updatedNote : note
      )
    }))
  },

  deleteNote: async (id: string) => {
    await noteRepository.delete(id)
    const { selectedNoteId, notes } = get()
    set({
      notes: notes.filter(note => note.id !== id),
      selectedNoteId: selectedNoteId === id ? null : selectedNoteId
    })
  },

  moveNoteToFolder: async (noteId: string, folderId: string | null) => {
    await noteRepository.update(noteId, { folderId })
    set(state => ({
      notes: state.notes.map(note =>
        note.id === noteId ? { ...note, folderId } : note
      )
    }))
  },

  searchNotes: async (ownerId: string, query: string) => {
    return noteRepository.search(ownerId, query)
  }
})
