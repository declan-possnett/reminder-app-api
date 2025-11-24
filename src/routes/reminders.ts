import { Router, type Request, type Response } from 'express'
import pool from '../db.js'

const router = Router()

router.get('/reminders', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM reminders LIMIT 10`)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

router.get('/reminders/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM reminders WHERE id = $1`, [
      req.params.id,
    ])

    if (result.rows.length === 0) {
      res.status(404).send('Reminder not found')
    } else {
      res.json(result.rows[0])
    }
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

export default router
