import { Request, Response, NextFunction } from 'express'
import { CognitoJwtVerifier } from 'aws-jwt-verify'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: string
    }
  }
}

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null

function getVerifier() {
  if (!verifier && process.env.COGNITO_USER_POOL_ID && process.env.COGNITO_CLIENT_ID) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      tokenUse: 'id',
      clientId: process.env.COGNITO_CLIENT_ID,
    })
  }
  return verifier
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const token = authHeader.slice(7)
  const v = getVerifier()
  if (!v) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  try {
    const payload = await v.verify(token)
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'unauthorized' })
  }
}
