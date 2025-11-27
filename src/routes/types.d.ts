import { Request } from 'express'

interface User {
  id: string
  email: string
  name: string
  lastlogin: string
  createdat: string
}

export interface AuthRequest extends Request {
  user?: User
}
