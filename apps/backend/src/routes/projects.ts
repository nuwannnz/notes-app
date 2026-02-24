import { Router, Request, Response, NextFunction } from 'express'
import { QueryCommand, PutCommand, UpdateCommand, DeleteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { ddb, TABLE_NAME } from '../db/client.js'
import { userPK, projectSK, projectPK } from '../db/keys.js'

export const projectsRouter = Router()

// GET /projects
projectsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const out = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': userPK(req.userId), ':prefix': 'PROJECT#' },
    }))
    res.json(out.Items ?? [])
  } catch (err) {
    next(err)
  }
})

// POST /projects
projectsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description = '', color = 'blue' } = req.body ?? {}
    if (!name) return res.status(400).json({ error: 'name is required' })

    const id = uuidv4()
    const now = Date.now()
    const project = {
      PK: userPK(req.userId),
      SK: projectSK(id),
      id,
      ownerId: req.userId,
      name,
      description,
      color,
      createdAt: now,
      updatedAt: now,
    }
    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: project }))
    res.status(201).json(project)
  } catch (err) {
    next(err)
  }
})

// PUT /projects/:id
projectsRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id
    const now = Date.now()
    const { name, description, color } = req.body ?? {}

    let updateExpr = 'SET updatedAt = :updatedAt'
    const exprValues: Record<string, unknown> = { ':updatedAt': now }
    const exprNames: Record<string, string> = {}

    if (name !== undefined) { updateExpr += ', #nm = :name'; exprValues[':name'] = name; exprNames['#nm'] = 'name' }
    if (description !== undefined) { updateExpr += ', description = :description'; exprValues[':description'] = description }
    if (color !== undefined) { updateExpr += ', color = :color'; exprValues[':color'] = color }

    const out = await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPK(req.userId), SK: projectSK(projectId) },
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

// DELETE /projects/:id
projectsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id

    // Delete all tasks for this project first
    const tasksOut = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': projectPK(projectId), ':prefix': 'TASK#' },
      ProjectionExpression: 'PK, SK',
    }))
    const writeRequests = (tasksOut.Items ?? []).map(item => ({
      DeleteRequest: { Key: { PK: item.PK, SK: item.SK } },
    }))
    for (let i = 0; i < writeRequests.length; i += 25) {
      await ddb.send(new BatchWriteCommand({
        RequestItems: { [TABLE_NAME]: writeRequests.slice(i, i + 25) },
      }))
    }

    await ddb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPK(req.userId), SK: projectSK(projectId) },
    }))
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
