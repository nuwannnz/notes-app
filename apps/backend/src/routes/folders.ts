import { Router, Request, Response, NextFunction } from 'express'
import { QueryCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { ddb, TABLE_NAME } from '../db/client.js'
import { userPK, folderSK } from '../db/keys.js'

export const foldersRouter = Router()

// GET /folders
foldersRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const out = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': userPK(req.userId), ':prefix': 'FOLDER#' },
    }))
    res.json(out.Items ?? [])
  } catch (err) {
    next(err)
  }
})

// POST /folders
foldersRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, parentId = null, icon, color } = req.body ?? {}
    if (!name) return res.status(400).json({ error: 'name is required' })

    const id = uuidv4()
    const now = Date.now()
    const folder = {
      PK: userPK(req.userId),
      SK: folderSK(id),
      id,
      ownerId: req.userId,
      parentId,
      name,
      icon,
      color,
      isExpanded: true,
      position: 0,
      createdAt: now,
      updatedAt: now,
    }
    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: folder }))
    res.status(201).json(folder)
  } catch (err) {
    next(err)
  }
})

// PUT /folders/:id
foldersRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folderId = req.params.id
    const now = Date.now()
    const { name, parentId, icon, color, isExpanded, position } = req.body ?? {}

    let updateExpr = 'SET updatedAt = :updatedAt'
    const exprValues: Record<string, unknown> = { ':updatedAt': now }
    const exprNames: Record<string, string> = {}

    if (name !== undefined) { updateExpr += ', #nm = :name'; exprValues[':name'] = name; exprNames['#nm'] = 'name' }
    if (parentId !== undefined) { updateExpr += ', parentId = :parentId'; exprValues[':parentId'] = parentId }
    if (icon !== undefined) { updateExpr += ', icon = :icon'; exprValues[':icon'] = icon }
    if (color !== undefined) { updateExpr += ', color = :color'; exprValues[':color'] = color }
    if (isExpanded !== undefined) { updateExpr += ', isExpanded = :isExpanded'; exprValues[':isExpanded'] = isExpanded }
    if (position !== undefined) { updateExpr += ', #pos = :position'; exprValues[':position'] = position; exprNames['#pos'] = 'position' }

    const out = await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPK(req.userId), SK: folderSK(folderId) },
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

// DELETE /folders/:id
foldersRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ddb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPK(req.userId), SK: folderSK(req.params.id) },
    }))
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
