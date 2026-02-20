import type { Task, TaskCreateInput, TaskUpdateInput } from '../entities'

export interface ITaskRepository {
  getAll(projectId: string): Promise<Task[]>
  getById(id: string): Promise<Task | undefined>
  getByProject(projectId: string): Promise<Task[]>
  create(input: TaskCreateInput): Promise<Task>
  update(id: string, input: TaskUpdateInput): Promise<Task>
  delete(id: string): Promise<void>
  deleteByProject(projectId: string): Promise<void>
}
