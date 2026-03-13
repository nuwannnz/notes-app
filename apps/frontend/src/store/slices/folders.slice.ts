import type { StateCreator } from "zustand";
import type {
  Folder,
  FolderCreateInput,
  FolderUpdateInput,
} from "@/core/entities";
import { foldersApi } from "@/infrastructure/api";

export interface FoldersSlice {
  folders: Folder[];
  selectedFolderId: string | null;
  isLoadingFolders: boolean;
  foldersError: string | null;

  // Actions
  loadFolders: () => Promise<void>;
  selectFolder: (folderId: string | null) => void;
  createFolder: (input: FolderCreateInput) => Promise<Folder>;
  updateFolder: (id: string, input: FolderUpdateInput) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  toggleFolderExpanded: (id: string) => Promise<void>;
  moveFolderToParent: (
    folderId: string,
    parentId: string | null,
  ) => Promise<void>;
}

export const createFoldersSlice: StateCreator<
  FoldersSlice,
  [],
  [],
  FoldersSlice
> = (set, get) => ({
  folders: [],
  selectedFolderId: null,
  isLoadingFolders: false,
  foldersError: null,

  loadFolders: async () => {
    set({ isLoadingFolders: true, foldersError: null });
    try {
      const folders = await foldersApi.list();
      set({ folders, isLoadingFolders: false });
    } catch (error) {
      set({
        isLoadingFolders: false,
        foldersError:
          error instanceof Error ? error.message : "Failed to load folders",
      });
    }
  },

  selectFolder: (folderId: string | null) => {
    set({ selectedFolderId: folderId });
  },

  createFolder: async (input: FolderCreateInput) => {
    const folder = await foldersApi.create(input);
    set((state) => ({
      folders: [...state.folders, folder],
    }));
    return folder;
  },

  updateFolder: async (id: string, input: FolderUpdateInput) => {
    const updatedFolder = await foldersApi.update(id, input);
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? updatedFolder : folder,
      ),
    }));
  },

  deleteFolder: async (id: string) => {
    await foldersApi.delete(id);
    const { selectedFolderId, folders } = get();
    set({
      folders: folders.filter((folder) => folder.id !== id),
      selectedFolderId: selectedFolderId === id ? null : selectedFolderId,
    });
  },

  toggleFolderExpanded: async (id: string) => {
    const folder = get().folders.find((f) => f.id === id);
    if (folder) {
      set((state) => ({
        folders: state.folders.map((f) =>
          f.id === id ? { ...f, isExpanded: !f.isExpanded } : f,
        ),
      }));
      // Don't sync isExpanded — it's UI-only state
    }
  },

  moveFolderToParent: async (folderId: string, parentId: string | null) => {
    await foldersApi.update(folderId, { parentId });
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === folderId ? { ...folder, parentId } : folder,
      ),
    }));
  },
});
