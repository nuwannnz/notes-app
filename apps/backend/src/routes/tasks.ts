import { Router, Request, Response, NextFunction } from 'express'
import { QueryCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { ddb, TABLE_NAME } from '../db/client.js'
import { projectPK, taskSK } from '../db/keys.js'

export const tasksRouter = Router({ mergeParams: true })

// GET /projects/:projectId/tasks
tasksRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params
    const out = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': projectPK(projectId), ':prefix': 'TASK#' },
    }))
    const tasks = (out.Items ?? []).sort((a, b) => a.position - b.position)
    res.json(tasks)
  } catch (err) {
    next(err)
  }
})

// POST /projects/:projectId/tasks
tasksRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params
    const { title, description = '' } = req.body ?? {}
    if (!title) return res.status(400).json({ error: 'title is required' })

    // Compute max position
    const existingOut = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': projectPK(projectId), ':prefix': 'TASK#' },
      ProjectionExpression: '#pos',
      ExpressionAttributeNames: { '#pos': 'position' },
    }))
    const maxPos = (existingOut.Items ?? []).reduce((max, item) => {
      const pos = typeof item.position === 'number' ? item.position + 1 : 0
      return Math.max(max, pos)
    }, 0)

    const id = uuidv4()
    const now = Date.now()
    const task = {
      PK: projectPK(projectId),
      SK: taskSK(id),
      id,
      projectId,
      title,
      description,
      isCompleted: false,
      position: maxPos,
      createdAt: now,
      updatedAt: now,
    }
    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: task }))
    res.status(201).json(task)
  } catch (err) {
    next(err)
  }
})

// PUT /projects/:projectId/tasks/:taskId
tasksRouter.put('/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, taskId } = req.params
    const now = Date.now()
    const { title, description, isCompleted, position } = req.body ?? {}

    let updateExpr = 'SET updatedAt = :updatedAt'
    const exprValues: Record<string, unknown> = { ':updatedAt': now }
    const exprNames: Record<string, string> = {}

    if (title !== undefined) { updateExpr += ', title = :title'; exprValues[':title'] = title }
    if (description !== undefined) { updateExpr += ', description = :description'; exprValues[':description'] = description }
    if (isCompleted !== undefined) { updateExpr += ', isCompleted = :isCompleted'; exprValues[':isCompleted'] = isCompleted }
    if (position !== undefined) { updateExpr += ', #pos = :position'; exprValues[':position'] = position; exprNames['#pos'] = 'position' }

    const out = await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: projectPK(projectId), SK: taskSK(taskId) },
      UpdateExpression: updateExpr,
      ExpressionAttributeValues: exprValues,
      ...(Object.keys(exprNames).length ? { ExpressionAttributeNames: exprNames } : {}),
      ReturnValues: 'ALL_NEW',
    }))
    res.json(out.Attributes)
  } catch (err) {
    next(err)
  }
})

// DELETE /projects/:projectId/tasks/:taskId
tasksRouter.delete('/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, taskId } = req.params
    await ddb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: projectPK(projectId), SK: taskSK(taskId) },
    }))
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
