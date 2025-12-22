import { Router, type Response } from 'express'
import pool from '@/db'
import { asyncHandler } from '@/utils/asyncHandler'
import { NotFoundError, ValidationError } from '@/utils/errors'
import { successResponse } from '@/utils/response'
import { authenticate } from '@/middleware/auth'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { AuthedRequest } from './types'

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
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const result = await pool.query(
      `SELECT * FROM reminders WHERE userId = $1 ORDER BY date ASC NULLS FIRST LIMIT 50`,
      [req.user.id],
    )

    return res.json(successResponse(result.rows))
  }),
)

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const result = await pool.query(
      `SELECT * FROM reminders WHERE id = $1 AND userId = $2`,
      [req.params.id, req.user.id],
    )

    if (!result.rowCount) {
      throw new NotFoundError('Reminder not found')
    }

    return res.json(successResponse(result.rows[0]))
  }),
)

router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const reminder = reminderSchema.safeParse(req.body)
    if (!reminder.success) {
      throw new ValidationError('Invalid input')
    }

    const { title, description, date, completed } = reminder.data

    const newReminder = await pool.query(
      `INSERT INTO reminders (id, title, description, date, completed, userId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [randomUUID(), title, description, date, completed, req.user.id],
    )

    return res.status(201).json(successResponse(newReminder.rows[0]))
  }),
)

router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const reminder = reminderSchema.safeParse(req.body)
    if (!reminder.success) {
      throw new ValidationError('Invalid input')
    }

    const { title, description, date, completed } = reminder.data

    const updatedReminder = await pool.query(
      `UPDATE reminders SET title = $1, description = $2, date = $3, completed = $4 WHERE id = $5 AND userId = $6 RETURNING *`,
      [title, description, date, completed, req.params.id, req.user.id],
    )

    if (!updatedReminder.rowCount) {
      throw new NotFoundError('Reminder not found')
    }

    return res.status(200).json(successResponse(updatedReminder.rows[0]))
  }),
)

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const result = await pool.query(
      `DELETE FROM reminders WHERE id = $1 AND userId = $2`,
      [req.params.id, req.user.id],
    )

    if (!result.rowCount) {
      throw new NotFoundError('Reminder not found')
    }

    return res.status(204).send()
  }),
)

export default router
