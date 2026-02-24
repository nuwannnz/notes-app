import { Express } from 'express'
import { notesRouter } from './notes.js'
import { foldersRouter } from './folders.js'
import { projectsRouter } from './projects.js'
import { tasksRouter } from './tasks.js'

export function mountRoutes(app: Express) {
  app.use('/notes', notesRouter)
  app.use('/folders', foldersRouter)
  app.use('/projects', projectsRouter)
  app.use('/projects/:projectId/tasks', tasksRouter)
}
