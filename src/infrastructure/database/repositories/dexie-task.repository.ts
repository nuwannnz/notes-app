import type { ITaskRepository } from '@/core/repositories'
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/core/entities'
import { createTaskPK, createTaskSK } from '@/core/entities'
import { db } from '../dexie/db'
import { generateId } from '@/utils'

export class DexieTaskRepository implements ITaskRepository {
  async getAll(projectId: string): Promise<Task[]> {
    return db.tasks
      .where('projectId')
      .equals(projectId)
      .sortBy('position')
  }

  async getById(id: string): Promise<Task | undefined> {
    return db.tasks.get(id)
  }

  async getByProject(projectId: string): Promise<Task[]> {
    return db.tasks
      .where('projectId')
      .equals(projectId)
      .sortBy('position')
  }

  async create(input: TaskCreateInput): Promise<Task> {
    const id = generateId()
    const now = Date.now()

    // Get max position for tasks in this project
    const siblings = await this.getByProject(input.projectId)
    const maxPosition = siblings.length > 0
      ? Math.max(...siblings.map(t => t.position))
      : -1

    const task: Task = {
      id,
      PK: createTaskPK(input.projectId),
      SK: createTaskSK(id),
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? '',
      isCompleted: false,
      position: maxPosition + 1,
      createdAt: now,
      updatedAt: now
    }

    await db.tasks.add(task)
    return task
  }

  async update(id: string, input: TaskUpdateInput): Promise<Task> {
    const now = Date.now()
    await db.tasks.update(id, {
      ...input,
      updatedAt: now
    })
    const task = await db.tasks.get(id)
    if (!task) {
      throw new Error(`Task with id ${id} not found`)
    }
    return task
  }

  async delete(id: string): Promise<void> {
    await db.tasks.delete(id)
  }

  async deleteByProject(projectId: string): Promise<void> {
    const tasks = await db.tasks.where('projectId').equals(projectId).toArray()
    await Promise.all(tasks.map(task => db.tasks.delete(task.id)))
  }
}

export const taskRepository = new DexieTaskRepository()
