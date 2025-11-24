import { Router, type Request, type Response } from 'express'
import pool from '../db.js'
import { asyncHandler } from 'src/utils/asyncHandler.js'
import { NotFoundError } from 'src/utils/errors.js'
import { successResponse } from 'src/utils/response.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(`SELECT * FROM reminders LIMIT 10`)
    res.json(successResponse(result.rows))
  }),
)

router.get(
  '/:id',
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

export default router
