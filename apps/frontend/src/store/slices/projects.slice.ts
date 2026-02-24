import type { StateCreator } from 'zustand'
import type { Project, ProjectCreateInput, ProjectUpdateInput } from '@/core/entities'
import { projectRepository } from '@/infrastructure/database'
import { syncEngine } from '@/services/sync/SyncEngine'

export interface ProjectsSlice {
  projects: Project[]
  selectedProjectId: string | null
  isLoadingProjects: boolean
  projectsError: string | null

  // Actions
  loadProjects: (ownerId: string) => Promise<void>
  selectProject: (projectId: string | null) => void
  createProject: (ownerId: string, input: ProjectCreateInput) => Promise<Project>
  updateProject: (id: string, input: ProjectUpdateInput) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

export const createProjectsSlice: StateCreator<ProjectsSlice, [], [], ProjectsSlice> = (set, get) => ({
  projects: [],
  selectedProjectId: null,
  isLoadingProjects: false,
  projectsError: null,

  loadProjects: async (ownerId: string) => {
    set({ isLoadingProjects: true, projectsError: null })
    try {
      const projects = await projectRepository.getAll(ownerId)
      set({ projects, isLoadingProjects: false })
    } catch (error) {
      set({
        isLoadingProjects: false,
        projectsError: error instanceof Error ? error.message : 'Failed to load projects'
      })
    }
  },

  selectProject: (projectId: string | null) => {
    set({ selectedProjectId: projectId })
  },

  createProject: async (ownerId: string, input: ProjectCreateInput) => {
    const project = await projectRepository.create(ownerId, input)
    set(state => ({
      projects: [project, ...state.projects],
      selectedProjectId: project.id
    }))
    syncEngine.write({
      entityType: 'project',
      entityId: project.id,
      operation: 'create',
      payload: { name: project.name, description: project.description, color: project.color },
    }).catch(console.error)
    return project
  },

  updateProject: async (id: string, input: ProjectUpdateInput) => {
    const updatedProject = await projectRepository.update(id, input)
    set(state => ({
      projects: state.projects.map(project =>
        project.id === id ? updatedProject : project
      )
    }))
    syncEngine.write({
      entityType: 'project',
      entityId: id,
      operation: 'update',
      payload: input as Record<string, unknown>,
    }).catch(console.error)
  },

  deleteProject: async (id: string) => {
    await projectRepository.delete(id)
    const { selectedProjectId, projects } = get()
    set({
      projects: projects.filter(project => project.id !== id),
      selectedProjectId: selectedProjectId === id ? null : selectedProjectId
    })
    syncEngine.write({
      entityType: 'project',
      entityId: id,
      operation: 'delete',
    }).catch(console.error)
  }
})
