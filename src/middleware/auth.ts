import { AuthedRequest, AuthRequest, User } from '@/routes/types'
import { UnauthorizedError } from '@/utils/errors'
import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): asserts req is AuthedRequest => {
  const authHeader = req.headers.authorization
  const tokenFromHeader = authHeader?.split(' ')[1]
  const tokenFromCookie = req.cookies?.token

  const token = tokenFromHeader || tokenFromCookie
  if (!token) {
    res.status(401).json({ error: 'Missing token' })
    return
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as User

    if (!user.id) {
      throw new UnauthorizedError('Not authorized')
    }

    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }
}
