import type { StateCreator } from "zustand";
import type { Note, NoteCreateInput, NoteUpdateInput } from "@/core/entities";
import { notesApi } from "@/infrastructure/api";

export interface NotesSlice {
  notes: Note[];
  selectedNoteId: string | null;
  isLoadingNotes: boolean;
  notesError: string | null;

  // Actions
  loadNotes: () => Promise<void>;
  selectNote: (noteId: string | null) => void;
  createNote: (input: NoteCreateInput) => Promise<Note>;
  updateNote: (id: string, input: NoteUpdateInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  moveNoteToFolder: (noteId: string, folderId: string | null) => Promise<void>;
  searchNotes: (query: string) => Promise<Note[]>;
}

export const createNotesSlice: StateCreator<NotesSlice, [], [], NotesSlice> = (
  set,
  get,
) => ({
  notes: [],
  selectedNoteId: null,
  isLoadingNotes: false,
  notesError: null,

  loadNotes: async () => {
    set({ isLoadingNotes: true, notesError: null });
    try {
      const notes = await notesApi.list();
      set({ notes, isLoadingNotes: false });
    } catch (error) {
      set({
        isLoadingNotes: false,
        notesError:
          error instanceof Error ? error.message : "Failed to load notes",
      });
    }
  },

  selectNote: (noteId: string | null) => {
    set({
      selectedNoteId: noteId,
      selectedFolderId: null,
    } as Partial<NotesSlice>);
  },

  createNote: async (input: NoteCreateInput) => {
    const note = await notesApi.create(input);
    set((state) => ({
      notes: [note, ...state.notes],
      selectedNoteId: note.id,
    }));
    return note;
  },

  updateNote: async (id: string, input: NoteUpdateInput) => {
    const updatedNote = await notesApi.update(id, input);
    set((state) => ({
      notes: state.notes.map((note) => (note.id === id ? updatedNote : note)),
    }));
  },

  deleteNote: async (id: string) => {
    await notesApi.delete(id);
    const { selectedNoteId, notes } = get();
    set({
      notes: notes.filter((note) => note.id !== id),
      selectedNoteId: selectedNoteId === id ? null : selectedNoteId,
    });
  },

  moveNoteToFolder: async (noteId: string, folderId: string | null) => {
    const updatedNote = await notesApi.update(noteId, { folderId });
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId ? updatedNote : note,
      ),
    }));
  },

  searchNotes: async (query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return get().notes;
    return get().notes.filter(
      (note) =>
        note.title.toLowerCase().includes(normalized) ||
        note.content.toLowerCase().includes(normalized),
    );
  },
});
