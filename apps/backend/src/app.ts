import express from 'express'
import { authMiddleware } from './middleware/auth.js'
import { errorHandler } from './middleware/errors.js'
import { mountRoutes } from './routes/index.js'

export const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(authMiddleware)

mountRoutes(app)

app.use(errorHandler)
