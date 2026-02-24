import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const raw = new DynamoDBClient({})
export const ddb = DynamoDBDocumentClient.from(raw)
export const TABLE_NAME = process.env.TABLE_NAME ?? 'NotesAppTable'
