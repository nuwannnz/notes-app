import type { Project, ProjectCreateInput, ProjectUpdateInput } from '../entities'

export interface IProjectRepository {
  getAll(ownerId: string): Promise<Project[]>
  getById(id: string): Promise<Project | undefined>
  create(ownerId: string, input: ProjectCreateInput): Promise<Project>
  update(id: string, input: ProjectUpdateInput): Promise<Project>
  delete(id: string): Promise<void>
}
