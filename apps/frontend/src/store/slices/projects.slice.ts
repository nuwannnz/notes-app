import type { StateCreator } from "zustand";
import type {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
} from "@/core/entities";
import { projectsApi } from "@/infrastructure/api";

export interface ProjectsSlice {
  projects: Project[];
  selectedProjectId: string | null;
  isLoadingProjects: boolean;
  projectsError: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  selectProject: (projectId: string | null) => void;
  createProject: (input: ProjectCreateInput) => Promise<Project>;
  updateProject: (id: string, input: ProjectUpdateInput) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const createProjectsSlice: StateCreator<
  ProjectsSlice,
  [],
  [],
  ProjectsSlice
> = (set, get) => ({
  projects: [],
  selectedProjectId: null,
  isLoadingProjects: false,
  projectsError: null,

  loadProjects: async () => {
    set({ isLoadingProjects: true, projectsError: null });
    try {
      const projects = await projectsApi.list();
      set({ projects, isLoadingProjects: false });
    } catch (error) {
      set({
        isLoadingProjects: false,
        projectsError:
          error instanceof Error ? error.message : "Failed to load projects",
      });
    }
  },

  selectProject: (projectId: string | null) => {
    set({ selectedProjectId: projectId });
  },

  createProject: async (input: ProjectCreateInput) => {
    const project = await projectsApi.create(input);
    set((state) => ({
      projects: [project, ...state.projects],
      selectedProjectId: project.id,
    }));
    return project;
  },

  updateProject: async (id: string, input: ProjectUpdateInput) => {
    const updatedProject = await projectsApi.update(id, input);
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? updatedProject : project,
      ),
    }));
  },

  deleteProject: async (id: string) => {
    await projectsApi.delete(id);
    const { selectedProjectId, projects } = get();
    set({
      projects: projects.filter((project) => project.id !== id),
      selectedProjectId: selectedProjectId === id ? null : selectedProjectId,
    });
  },
});
