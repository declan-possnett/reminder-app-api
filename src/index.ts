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
app.get('/reminders', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM reminders LIMIT 1`)
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
