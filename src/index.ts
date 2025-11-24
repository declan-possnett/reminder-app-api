import express from 'express'
import remindersRouter from './routes/reminders.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use('/reminders', remindersRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
