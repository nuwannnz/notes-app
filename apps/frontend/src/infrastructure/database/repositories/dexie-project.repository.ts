import type { IProjectRepository } from '@/core/repositories'
import type { Project, ProjectCreateInput, ProjectUpdateInput } from '@/core/entities'
import { createProjectPK, createProjectSK } from '@/core/entities'
import { db } from '../dexie/db'
import { generateId } from '@/utils'

export class DexieProjectRepository implements IProjectRepository {
  async getAll(ownerId: string): Promise<Project[]> {
    return db.projects
      .where('ownerId')
      .equals(ownerId)
      .sortBy('updatedAt')
      .then(projects => projects.reverse())
  }

  async getById(id: string): Promise<Project | undefined> {
    return db.projects.get(id)
  }

  async create(ownerId: string, input: ProjectCreateInput): Promise<Project> {
    const id = generateId()
    const now = Date.now()

    const project: Project = {
      id,
      PK: createProjectPK(ownerId),
      SK: createProjectSK(id),
      ownerId,
      name: input.name,
      description: input.description ?? '',
      color: input.color ?? 'blue',
      createdAt: now,
      updatedAt: now
    }

    await db.projects.add(project)
    return project
  }

  async update(id: string, input: ProjectUpdateInput): Promise<Project> {
    const now = Date.now()
    await db.projects.update(id, {
      ...input,
      updatedAt: now
    })
    const project = await db.projects.get(id)
    if (!project) {
      throw new Error(`Project with id ${id} not found`)
    }
    return project
  }

  async delete(id: string): Promise<void> {
    // Delete all tasks in this project
    const tasks = await db.tasks.where('projectId').equals(id).toArray()
    await Promise.all(tasks.map(task => db.tasks.delete(task.id)))

    // Delete the project itself
    await db.projects.delete(id)
  }
}

export const projectRepository = new DexieProjectRepository()
