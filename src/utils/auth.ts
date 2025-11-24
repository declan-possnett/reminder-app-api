import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET)
}

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10)
}

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}
