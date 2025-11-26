import { Router, type Request, type Response } from 'express'
import pool from '@/db'
import { asyncHandler } from '@/utils/asyncHandler'
import { NotFoundError } from '@/utils/errors'
import { errorResponse, successResponse } from '@/utils/response'
import { authenticate } from '@/middleware/auth'
import { z } from 'zod'

const router = Router()

const reminderSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  date: z.coerce.date().nullable().default(null),
  completed: z.boolean().default(false),
})

router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(`SELECT * FROM reminders LIMIT 10`)
    res.json(successResponse(result.rows))
  }),
)

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(`SELECT * FROM reminders WHERE id = $1`, [
      req.params.id,
    ])

    if (result.rows.length === 0) {
      throw new NotFoundError('Reminder not found')
    }

    res.json(successResponse(result.rows[0]))
  }),
)

router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const reminder = reminderSchema.safeParse(req.body)
    if (!reminder.success) {
      return res.status(400).json(errorResponse('Invalid input'))
    }

    const { title, description, date, completed } = reminder.data

    const newReminder = await pool.query(
      `INSERT INTO reminders (title, description, date, completed) VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, date, completed],
    )

    return res.status(201).json(successResponse(newReminder.rows[0]))
  }),
)

export default router
