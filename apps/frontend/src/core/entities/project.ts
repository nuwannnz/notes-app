import type { BaseEntity, DynamoDBKeys } from './base'

export type ProjectColor = 'blue' | 'purple' | 'rose' | 'orange' | 'green' | 'teal' | 'amber' | 'slate'

export interface Project extends BaseEntity, DynamoDBKeys {
  ownerId: string
  name: string
  description: string
  color: ProjectColor
}

export type ProjectCreateInput = Pick<Project, 'name'> & {
  description?: string
  color?: ProjectColor
}

export type ProjectUpdateInput = Partial<Pick<Project, 'name' | 'description' | 'color'>>

export function createProjectPK(ownerId: string): string {
  return `USER#${ownerId}`
}

export function createProjectSK(projectId: string): string {
  return `PROJECT#${projectId}`
}
