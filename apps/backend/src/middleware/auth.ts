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
  // Production: API Gateway JWT authorizer already validated the token,
  // extract sub from requestContext claims
  const event = (req as any).apiGateway?.event
  const sub = event?.requestContext?.authorizer?.jwt?.claims?.sub as string | undefined
  if (sub) {
    req.userId = sub
    return next()
  }

  // Local dev: verify Bearer token manually
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
