import { Router, type Request, type Response } from 'express'
import pool from '@/db'
import { asyncHandler } from '@/utils/asyncHandler'
import { NotFoundError, ValidationError } from '@/utils/errors'
import { errorResponse, successResponse } from '@/utils/response'
import { authenticate } from '@/middleware/auth'
import { z } from 'zod'
import { randomUUID } from 'crypto'

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
    const result = await pool.query(
      `SELECT * FROM reminders WHERE userid = $1 LIMIT 10`,
      [(req as any).user.id],
    )

    return res.json(successResponse(result.rows))
  }),
)

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(
      `SELECT * FROM reminders WHERE id = $1 AND userid = $2`,
      [req.params.id, (req as any).user.id],
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
  asyncHandler(async (req: Request, res: Response) => {
    const reminder = reminderSchema.safeParse(req.body)
    if (!reminder.success) {
      throw new ValidationError('Invalid input')
    }

    const { title, description, date, completed } = reminder.data

    const newReminder = await pool.query(
      `INSERT INTO reminders (id, title, description, date, completed, userid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [randomUUID(), title, description, date, completed, (req as any).user.id],
    )

    return res.status(201).json(successResponse(newReminder.rows[0]))
  }),
)

router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const reminder = reminderSchema.safeParse(req.body)
    if (!reminder.success) {
      throw new ValidationError('Invalid input')
    }

    const { title, description, date, completed } = reminder.data

    const newReminder = await pool.query(
      `UPDATE reminders SET title = $1, description = $2, date = $3, completed = $4 WHERE id = $5 AND userid = $6 RETURNING *`,
      [
        title,
        description,
        date,
        completed,
        req.params.id,
        (req as any).user.id,
      ],
    )

    return res.status(200).json(successResponse(newReminder.rows[0]))
  }),
)

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(
      `DELETE FROM reminders WHERE id = $1 AND userid = $2`,
      [req.params.id, (req as any).user.id],
    )

    if (result.rowCount === 0) {
      return res.status(404).json(errorResponse('Reminder not found'))
    }

    return res.status(204)
  }),
)

export default router
