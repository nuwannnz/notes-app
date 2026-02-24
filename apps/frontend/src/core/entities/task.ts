import type { BaseEntity, DynamoDBKeys } from './base'

export interface Task extends BaseEntity, DynamoDBKeys {
  projectId: string
  title: string
  description: string
  isCompleted: boolean
  position: number
}

export type TaskCreateInput = Pick<Task, 'title'> & {
  projectId: string
  description?: string
}

export type TaskUpdateInput = Partial<Pick<Task, 'title' | 'description' | 'isCompleted' | 'position'>>

export function createTaskPK(projectId: string): string {
  return `PROJECT#${projectId}`
}

export function createTaskSK(taskId: string): string {
  return `TASK#${taskId}`
}
