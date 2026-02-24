import express from 'express'
import { authMiddleware } from './middleware/auth.js'
import { errorHandler } from './middleware/errors.js'
import { mountRoutes } from './routes/index.js'

export const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(authMiddleware)

mountRoutes(app)

app.use(errorHandler)
