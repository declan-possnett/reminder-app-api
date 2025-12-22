import { Response, Router } from 'express'
import { generateToken, hashPassword, comparePassword } from '@/utils/auth'
import { errorResponse, successResponse } from '@/utils/response'
import { asyncHandler } from '@/utils/asyncHandler'
import rateLimit from 'express-rate-limit'
import pool from '@/db'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { authenticate } from '@/middleware/auth'
import { AuthedRequest } from './types'

const router = Router()

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
})

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later' },
})

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const parse = registerSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json(errorResponse('Invalid input'))
    }

    const formattedEmail = parse.data.email.trim().toLowerCase()
    const formattedName = parse.data.name.trim().toLowerCase()
    const hashedPassword = await hashPassword(parse.data.password)

    const existingUser = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [formattedEmail],
    )

    if (existingUser.rowCount) {
      return res.status(409).json(errorResponse('User already exists'))
    }

    const user = await pool.query(
      `INSERT INTO users (id, email, password, name, createdAt) VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [randomUUID(), formattedEmail, hashedPassword, formattedName],
    )

    return res.status(201).json(successResponse(user.rows))
  }),
)

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const parse = loginSchema.safeParse(req.body)
    if (!parse.success) {
      return res.status(400).json(errorResponse('Invalid input'))
    }

    const formattedEmail = parse.data.email.trim().toLowerCase()

    const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      formattedEmail,
    ])

    if (!user.rowCount) {
      return res.status(401).json(errorResponse('Invalid credentials'))
    }

    const match = await comparePassword(
      parse.data?.password,
      user.rows[0]?.password,
    )

    if (!match) {
      return res.status(401).json(errorResponse('Invalid credentials'))
    }

    const token = generateToken(user.rows[0])

    const updatedUser = await pool.query(
      `UPDATE users SET lastLogin = NOW() WHERE id = $1 RETURNING *`,
      [user.rows[0].id],
    )

    const { password: _, ...safeUser } = updatedUser.rows[0]

    return res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .json(successResponse(safeUser))
  }),
)

router.get('/logout', async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  })

  res.json({ message: 'Logged out successfully' })
})

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    res.json({
      id: req.user.id,
    })
  }),
)

export default router
