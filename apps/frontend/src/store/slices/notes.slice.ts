import type { StateCreator } from 'zustand'
import type { Note, NoteCreateInput, NoteUpdateInput } from '@/core/entities'
import { noteRepository } from '@/infrastructure/database'
import { syncEngine } from '@/services/sync/SyncEngine'

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
    set({ selectedNoteId: noteId, selectedFolderId: null } as Partial<NotesSlice>)
  },

  createNote: async (ownerId: string, input: NoteCreateInput) => {
    const note = await noteRepository.create(ownerId, input)
    set(state => ({
      notes: [note, ...state.notes],
      selectedNoteId: note.id
    }))
    // Enqueue cloud sync (fire-and-forget)
    syncEngine.write({
      entityType: 'note',
      entityId: note.id,
      operation: 'create',
      payload: { title: note.title, folderId: note.folderId, content: note.content },
    }).catch(console.error)
    return note
  },

  updateNote: async (id: string, input: NoteUpdateInput) => {
    const updatedNote = await noteRepository.update(id, input)
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id ? updatedNote : note
      )
    }))
    syncEngine.write({
      entityType: 'note',
      entityId: id,
      operation: 'update',
      payload: input as Record<string, unknown>,
    }).catch(console.error)
  },

  deleteNote: async (id: string) => {
    await noteRepository.delete(id)
    const { selectedNoteId, notes } = get()
    set({
      notes: notes.filter(note => note.id !== id),
      selectedNoteId: selectedNoteId === id ? null : selectedNoteId
    })
    syncEngine.write({
      entityType: 'note',
      entityId: id,
      operation: 'delete',
    }).catch(console.error)
  },

  moveNoteToFolder: async (noteId: string, folderId: string | null) => {
    await noteRepository.update(noteId, { folderId })
    set(state => ({
      notes: state.notes.map(note =>
        note.id === noteId ? { ...note, folderId } : note
      )
    }))
    syncEngine.write({
      entityType: 'note',
      entityId: noteId,
      operation: 'update',
      payload: { folderId },
    }).catch(console.error)
  },

  searchNotes: async (ownerId: string, query: string) => {
    return noteRepository.search(ownerId, query)
  }
})
