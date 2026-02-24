export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
}

export interface DynamoDBKeys {
  PK: string
  SK: string
}

export type EntityWithKeys<T extends BaseEntity> = T & DynamoDBKeys
