import { Router, Request, Response, NextFunction } from 'express'
import {
  QueryCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { ddb, TABLE_NAME } from '../db/client.js'
import { userPK, noteSK, notePK, blockSK } from '../db/keys.js'

export const notesRouter = Router()

// GET /notes
notesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const out = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': userPK(req.userId), ':prefix': 'NOTE#' },
    }))
    res.json(out.Items ?? [])
  } catch (err) {
    next(err)
  }
})

// POST /notes
notesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title = 'Untitled', folderId = '', content = '' } = req.body ?? {}
    const id = uuidv4()
    const now = Date.now()

    const note: Record<string, unknown> = {
      PK: userPK(req.userId),
      SK: noteSK(id),
      id,
      ownerId: req.userId,
      folderId,
      title,
      content,
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      createdAt: now,
      updatedAt: now,
    }
    if (folderId) {
      note.GSI1PK = `FOLDER#${folderId}`
      note.GSI1SK = `NOTE#${id}`
    }

    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: note }))
    res.status(201).json(note)
  } catch (err) {
    next(err)
  }
})

// GET /notes/:id
notesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noteId = req.params.id
    const noteOut = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPK(req.userId), SK: noteSK(noteId) },
    }))
    if (!noteOut.Item) return res.status(404).json({ error: 'note not found' })

    const blocksOut = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': notePK(noteId), ':prefix': 'BLOCK#' },
    }))
    const blocks = (blocksOut.Items ?? []).sort((a, b) => a.position - b.position)

    res.json({ ...noteOut.Item, blocks })
  } catch (err) {
    next(err)
  }
})

// PUT /notes/:id
notesRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noteId = req.params.id
    const noteOut = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPK(req.userId), SK: noteSK(noteId) },
    }))
    if (!noteOut.Item) return res.status(404).json({ error: 'note not found' })

    const now = Date.now()
    const { title, folderId, content, isPinned, isArchived, isTrashed, blocks } = req.body ?? {}

    if (Array.isArray(blocks) && blocks.length > 0) {
      // Transactional update with blocks
      const existingOut = await ddb.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: { ':pk': notePK(noteId), ':prefix': 'BLOCK#' },
        ProjectionExpression: 'PK, SK',
      }))

      const transactItems: any[] = []

      // Delete old blocks
      for (const item of existingOut.Items ?? []) {
        transactItems.push({ Delete: { TableName: TABLE_NAME, Key: { PK: item.PK, SK: item.SK } } })
      }

      // Put new blocks
      for (const bi of blocks) {
        const blockId = bi.id || uuidv4()
        transactItems.push({
          Put: {
            TableName: TABLE_NAME,
            Item: {
              PK: notePK(noteId),
              SK: blockSK(bi.position, blockId),
              id: blockId,
              noteId,
              type: bi.type,
              content: bi.content,
              position: bi.position,
              metadata: bi.metadata,
              createdAt: now,
              updatedAt: now,
            },
          },
        })
      }

      // Update note metadata
      let updateExpr = 'SET updatedAt = :updatedAt'
      const exprValues: Record<string, unknown> = { ':updatedAt': now }
      const exprNames: Record<string, string> = {}
      if (title !== undefined) { updateExpr += ', title = :title'; exprValues[':title'] = title }
      if (content !== undefined) { updateExpr += ', content = :content'; exprValues[':content'] = content }

      transactItems.push({
        Update: {
          TableName: TABLE_NAME,
          Key: { PK: userPK(req.userId), SK: noteSK(noteId) },
          UpdateExpression: updateExpr,
          ExpressionAttributeValues: exprValues,
          ...(Object.keys(exprNames).length ? { ExpressionAttributeNames: exprNames } : {}),
        },
      })

      if (transactItems.length <= 100) {
        await ddb.send(new TransactWriteCommand({ TransactItems: transactItems }))
      }
    } else {
      // Metadata-only update
      let updateExpr = 'SET updatedAt = :updatedAt'
      const exprValues: Record<string, unknown> = { ':updatedAt': now }
      const exprNames: Record<string, string> = {}

      if (title !== undefined) { updateExpr += ', title = :title'; exprValues[':title'] = title }
      if (content !== undefined) { updateExpr += ', content = :content'; exprValues[':content'] = content }
      if (folderId !== undefined) { updateExpr += ', folderId = :folderId'; exprValues[':folderId'] = folderId }
      if (isPinned !== undefined) { updateExpr += ', isPinned = :isPinned'; exprValues[':isPinned'] = isPinned }
      if (isArchived !== undefined) { updateExpr += ', isArchived = :isArchived'; exprValues[':isArchived'] = isArchived }
      if (isTrashed !== undefined) { updateExpr += ', isTrashed = :isTrashed'; exprValues[':isTrashed'] = isTrashed }

      await ddb.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPK(req.userId), SK: noteSK(noteId) },
        UpdateExpression: updateExpr,
        ExpressionAttributeValues: exprValues,
        ...(Object.keys(exprNames).length ? { ExpressionAttributeNames: exprNames } : {}),
      }))
    }

    const updatedOut = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPK(req.userId), SK: noteSK(noteId) },
    }))
    res.json(updatedOut.Item)
  } catch (err) {
    next(err)
  }
})

// DELETE /notes/:id
notesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noteId = req.params.id
    const noteOut = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPK(req.userId), SK: noteSK(noteId) },
    }))
    if (!noteOut.Item) return res.status(404).json({ error: 'note not found' })

    // Query and batch-delete blocks
    const blocksOut = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': notePK(noteId), ':prefix': 'BLOCK#' },
      ProjectionExpression: 'PK, SK',
    }))

    const writeRequests = (blocksOut.Items ?? []).map(item => ({
      DeleteRequest: { Key: { PK: item.PK, SK: item.SK } },
    }))
    for (let i = 0; i < writeRequests.length; i += 25) {
      await ddb.send(new BatchWriteCommand({
        RequestItems: { [TABLE_NAME]: writeRequests.slice(i, i + 25) },
      }))
    }

    await ddb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: userPK(req.userId), SK: noteSK(noteId) },
    }))
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
