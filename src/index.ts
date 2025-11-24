import express from 'express'
import { Pool } from 'pg'
import type { Request, Response } from 'express'

const app = express()
const PORT = process.env.PORT || 3000

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// Middleware
app.use(express.json())

// Routes
app.get('/reminders/:id', async (req: Request, res: Response) => {
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

app.get('/reminders', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM reminders LIMIT 10`)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
